import os, json
import pandas as pd
import joblib
import requests as req_lib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)
CORS(app)

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
EXPRESS_URL = os.environ.get('EXPRESS_URL', 'http://localhost:5000')

try:
    preprocessor = joblib.load(os.path.join(MODELS_DIR, 'preprocessor.joblib'))
    myntra_model = joblib.load(os.path.join(MODELS_DIR, 'model.joblib'))
    with open(os.path.join(MODELS_DIR, 'products.json'), encoding='utf-8') as f:
        myntra_df = pd.DataFrame(json.load(f))
    print(f"[OK] Myntra fallback: {len(myntra_df)} sản phẩm")
except Exception as e:
    raise RuntimeError(f"Thiếu model files trong '{MODELS_DIR}'. Chạy notebook train_knn.ipynb trước.\n{e}")

_COLOR_NORM = {
    'blue': 'Blue', 'navy': 'Blue', 'navy blue': 'Blue', 'dark blue': 'Blue',
    'light blue': 'Blue', 'baby blue': 'Blue', 'cobalt': 'Blue', 'royal blue': 'Blue',
    'blue and cream': 'Blue', 'blue and white': 'Blue', 'blue and c': 'Blue',
    'black': 'Black',
    'beige': 'Beige', 'cream': 'Beige', 'off white': 'Beige', 'ivory': 'Beige', 'nude': 'Beige',
    'brown': 'Brown', 'tan': 'Brown', 'caramel': 'Brown', 'chocolate': 'Brown', 'cognac': 'Brown',
    'white': 'White',
    'red': 'Red', 'burgundy': 'Maroon', 'wine': 'Maroon', 'maroon': 'Maroon',
    'green': 'Green', 'olive': 'Green', 'khaki': 'Green', 'sage': 'Green',
    'grey': 'Grey', 'gray': 'Grey', 'charcoal': 'Grey',
    'pink': 'Pink', 'rose': 'Pink', 'blush': 'Pink', 'mauve': 'Pink',
    'gold': 'Gold', 'yellow': 'Gold', 'mustard': 'Gold',
    'silver': 'Silver', 'metallic': 'Silver',
    'purple': 'Purple', 'violet': 'Purple', 'lavender': 'Purple',
    'orange': 'Orange', 'coral': 'Orange',
}

def _normalize_color(raw: str) -> str:
    primary = raw.split(' and ')[0].strip().lower()
    return _COLOR_NORM.get(primary, _COLOR_NORM.get(raw.lower().strip(), 'Black'))

def _tags_to_category(tags: list) -> str:
    joined = ' '.join(t.lower() for t in tags)
    if 'trolley' in joined or 'luggage' in joined: return 'Trolley/Luggage'
    if 'backpack' in joined:                       return 'Backpack'
    if 'clutch' in joined:                         return 'Clutch'
    if 'wallet' in joined or 'purse' in joined:    return 'Wallet'
    if 'crossbody' in joined or 'sling' in joined: return 'Sling'
    if 'tote' in joined:                           return 'Tote'
    return 'Handbag'

loom_model = None
loom_df    = None

def _load_loom_from_express():
    global loom_model, loom_df
    try:
        resp = req_lib.get(f"{EXPRESS_URL}/api/products/for-ml", timeout=5)
        resp.raise_for_status()
        raw = resp.json()
        if not raw:
            return False

        df = pd.DataFrame([{
            'id':       str(p.get('id', '')),
            'name':     p.get('name', ''),
            'price':    float(p.get('price', 0)),
            'category': _tags_to_category(p.get('tags', [])),
            'color':    _normalize_color(p.get('color', 'Black')),
            'image':    p.get('image', '/placeholder-bag.png'),
        } for p in raw])

        X   = preprocessor.transform(df[['price', 'category', 'color']])
        mdl = NearestNeighbors(n_neighbors=min(5, len(df)), metric='euclidean')
        mdl.fit(X)
        loom_df, loom_model = df, mdl
        print(f"[Cách A] {len(df)} Loom products, KNN k={mdl.n_neighbors}")
        return True
    except Exception as e:
        print(f"[Cách B] Không fetch được Loom products: {e}")
        return False

_load_loom_from_express()


def _recommend(price, category, color, price_min=None, price_max=None, n=5):
    X_input = preprocessor.transform(
        pd.DataFrame([{'price': price, 'category': category, 'color': color}])
    )

    if loom_model is not None and loom_df is not None:
        _, idxs  = loom_model.kneighbors(X_input, n_neighbors=loom_model.n_samples_fit_)
        products, source = loom_df, 'loom'
    else:
        _, idxs  = myntra_model.kneighbors(X_input, n_neighbors=min(20, len(myntra_df)))
        products, source = myntra_df, 'myntra_fallback'

    ordered = [{
        'id':       str(products.iloc[i].get('id', '')),
        'name':     str(products.iloc[i].get('name', products.iloc[i].get('ProductName', ''))),
        'category': str(products.iloc[i].get('category', '')),
        'color':    str(products.iloc[i].get('color', '')),
        'price':    int(products.iloc[i].get('price', 0)),
        'image':    str(products.iloc[i].get('image', '/placeholder-bag.png')),
    } for i in idxs[0]]

    if price_min is not None and price_max is not None:
        filtered = [p for p in ordered if price_min <= p['price'] <= price_max]
        if len(filtered) < 3:
            margin   = 150000 if price_max > 1e8 else (price_max - price_min) * 0.2
            filtered = [p for p in ordered
                        if (price_min - margin) <= p['price'] <= (price_max + margin)]
        return filtered[:n], source

    return ordered[:n], source


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'mode':   'loom' if loom_model else 'myntra_fallback',
        'loom_products': len(loom_df) if loom_df is not None else 0,
    })


@app.route('/recommend', methods=['POST'])
def recommend():
    data     = request.get_json(force=True, silent=True) or {}
    price    = data.get('price')
    category = data.get('category')
    color    = data.get('color')

    if price is None or category is None or color is None:
        return jsonify({'error': 'Thiếu field: price, category, color'}), 400

    try:
        price_min = data.get('price_min')
        price_max = data.get('price_max')
        results, source = _recommend(
            float(price), str(category), str(color),
            price_min=float(price_min) if price_min is not None else None,
            price_max=float(price_max) if price_max is not None else None,
        )
        return jsonify({'recommendations': results, 'source': source})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
