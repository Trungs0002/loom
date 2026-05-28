/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from './AdminCategories';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const { addToCart } = useCart();
  const { user, favorites, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const isFavorited = favorites.some(f => (f._id || f) === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setSelectedColorIdx(0);

        // Fetch related products
        const allRes = await fetch(`${API_BASE}/api/products`);
        const allData = await allRes.json();
        
        const related = allData.filter(p => 
          p._id !== id && 
          p.tags?.some(tag => data.tags?.includes(tag))
        ).slice(0, 4);
        
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="text-center py-xxl text-on-surface-variant">Loading...</div>;
  if (!product) return <div className="text-center py-xxl text-on-surface-variant">Product not found</div>;

  // Resolve color images: prefer colorImages array, fall back to single image
  const colorImages = product.colorImages?.length
    ? product.colorImages
    : product.colors?.map(c => ({ color: c, image: product.image })) || [{ color: '', image: product.image }];

  const currentEntry = colorImages[selectedColorIdx] || colorImages[0] || {};
  const currentImage = getImgUrl(currentEntry.image || product.image);
  const currentColor = currentEntry.color;

  const handleAddToCart = () => {
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi tới trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: currentImage,
      colors: [currentColor],
    }, quantity);
    alert('Added to cart!');
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào danh sách yêu thích. Đi tới trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }
    await toggleFavorite(product._id);
  };


  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xxl mb-xxl">
        {/* Left: Images */}
        <div className="md:col-span-7 flex flex-col gap-gutter">
          {/* Main image */}
          <div className="bg-surface-container-low w-full aspect-square overflow-hidden rounded-xl">
            <img
              alt={`${product.name} - ${currentColor}`}
              className="w-full h-full object-cover transition-all duration-500"
              src={currentImage}
            />
          </div>
          {/* Thumbnail strip — one per color */}
          {colorImages.length > 1 && (
            <div className="flex gap-md">
              {colorImages.map((ci, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColorIdx(i)}
                  className={`w-20 aspect-square overflow-hidden rounded border-2 transition-all ${i === selectedColorIdx ? 'border-primary' : 'border-transparent hover:border-outline-variant'}`}
                >
                  <img
                    src={getImgUrl(ci.image)}
                    alt={ci.color}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="md:col-span-5 flex flex-col">
          <div className="mb-xl">
            {product.tags?.map(tag => (
              <span key={tag} className="inline-block bg-surface-container text-primary font-label-caps text-label-caps px-md py-xs rounded-full mb-md tracking-wider mr-sm text-[11px]">{tag}</span>
            ))}
            <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">{product.name}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Color selector */}
          {colorImages.length > 0 && (
            <div className="mb-lg border-b border-outline-variant/30 pb-lg">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-md">
                Color: <span className="text-primary ml-sm">{currentColor}</span>
              </p>
              <div className="flex flex-wrap gap-sm">
                {colorImages.map((ci, i) => (
                  <button
                    key={i}
                    aria-label={`Select ${ci.color}`}
                    onClick={() => setSelectedColorIdx(i)}
                    className={`px-md py-xs rounded-full border font-label-caps text-label-caps text-[12px] transition-all capitalize ${
                      i === selectedColorIdx
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {ci.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          <div className="mb-xl space-y-md text-on-surface-variant">
            {product.category && (
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-sm gap-xl">
                <span className="font-label-caps text-label-caps flex-shrink-0 mt-xs">Category</span>
                <span className="text-right">{product.category}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-sm gap-xl">
                <span className="font-label-caps text-label-caps flex-shrink-0 mt-xs">Dimensions</span>
                <span className="text-right">{product.dimensions}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-sm gap-xl">
                <span className="font-label-caps text-label-caps flex-shrink-0 mt-xs">Material</span>
                <span className="text-right">{product.material}</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-sm gap-xl">
              <span className="font-label-caps text-label-caps flex-shrink-0">Status</span>
              <span className="text-primary flex items-center gap-xs text-right">
                {product.stock > 0
                  ? <><span className="material-symbols-outlined text-[16px]">check_circle</span> In Stock ({product.stock})</>
                  : <><span className="material-symbols-outlined text-[16px]">cancel</span> Out of Stock</>}
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-lg mt-auto mb-md">
            <div className="flex items-center border border-outline-variant rounded">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-md py-sm hover:bg-surface-container transition-colors text-primary">−</button>
              <span className="px-md font-body-md text-primary">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-md py-sm hover:bg-surface-container transition-colors text-primary">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-grow font-label-caps text-label-caps py-md rounded transition-opacity shadow-[0_4px_20px_rgba(8,31,92,0.05)] ${product.stock > 0 ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {/* Favourite */}
            <button
              onClick={handleToggleFavorite}
              className={`px-md py-sm border border-outline-variant rounded hover:bg-surface-container transition-colors flex items-center justify-center ${isFavorited ? 'text-primary' : 'text-on-surface-variant'}`}
              aria-label={isFavorited ? "Remove from favourite" : "Add to favourite"}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
            </button>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant text-center opacity-70 text-[11px]">Free shipping on orders over 500.000 VND</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-xxl pt-xl border-t border-outline-variant/20">
        <div className="flex gap-xl border-b border-outline-variant/20 mb-lg">
          {['Description', 'Details'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-label-caps text-label-caps pb-sm transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="max-w-3xl py-md">
          {activeTab === 'Description' && <p className="text-on-surface-variant leading-relaxed">{product.description || '—'}</p>}
          {activeTab === 'Details' && (
            <div className="text-on-surface-variant leading-relaxed space-y-md">
              {product.material && <p><span className="font-bold text-primary">Material:</span> {product.material}</p>}
              {product.innerLining && <p><span className="font-bold text-primary">Inner lining:</span> {product.innerLining}</p>}
              {product.numberStraps && <p><span className="font-bold text-primary">Number of straps:</span> {product.numberStraps}</p>}
              {product.detachableStrap && <p><span className="font-bold text-primary">Detachable strap:</span> {product.detachableStrap}</p>}
              {product.adjustableStrap && <p><span className="font-bold text-primary">Adjustable strap:</span> {product.adjustableStrap}</p>}
              {product.closureType && <p><span className="font-bold text-primary">Closure type:</span> {product.closureType}</p>}
              {product.innerCompartments && <p><span className="font-bold text-primary">Inner compartments:</span> {product.innerCompartments}</p>}
              {product.dimensions && <p><span className="font-bold text-primary">Bag size:</span> {product.dimensions}</p>}
              {product.weight && <p><span className="font-bold text-primary">Weight:</span> {product.weight}</p>}
              {product.careInstructions && <p><span className="font-bold text-primary">Care instructions:</span> {product.careInstructions}</p>}
              {product.tags?.length > 0 && <p><span className="font-bold text-primary">Tags:</span> {product.tags.join(', ')}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-xxl pt-xxl border-t border-outline-variant/20">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xl">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
            {relatedProducts.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="group flex flex-col">
                <div className="bg-surface-container-low rounded-xl overflow-hidden mb-md aspect-[4/5] relative">
                  <img 
                    alt={p.name} 
                    src={getImgUrl(p.colorImages?.[0]?.image || p.image || '')} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {p.category && (
                    <div className="absolute top-sm right-sm bg-primary/80 backdrop-blur-sm px-sm py-xs rounded font-label-caps text-label-caps text-on-primary text-[10px] capitalize">
                      {p.category}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-headline-md text-[18px] text-primary mb-xs">{p.name}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;



