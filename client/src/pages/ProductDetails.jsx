/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setSelectedColorIdx(0);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-xxl text-on-surface-variant">Loading...</div>;
  if (!product) return <div className="text-center py-xxl text-on-surface-variant">Product not found</div>;

  // Resolve color images: prefer colorImages array, fall back to single image
  const colorImages = product.colorImages?.length
    ? product.colorImages
    : product.colors?.map(c => ({ color: c, image: product.image })) || [{ color: '', image: product.image }];

  const currentEntry = colorImages[selectedColorIdx] || colorImages[0] || {};
  const currentImage = currentEntry.image || product.image;
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


  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xxl mb-xxl">
        {/* Left: Images */}
        <div className="md:col-span-7 flex flex-col gap-gutter">
          {/* Main image */}
          <div className="bg-surface-container-low w-full aspect-[4/5] overflow-hidden rounded-xl">
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
                    src={ci.image}
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
            <p className="font-body-lg text-body-lg text-on-surface-variant">${product.price}</p>
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
              <div className="flex justify-between border-b border-outline-variant/30 pb-sm">
                <span className="font-label-caps text-label-caps">Category</span>
                <span>{product.category}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between border-b border-outline-variant/30 pb-sm">
                <span className="font-label-caps text-label-caps">Dimensions</span>
                <span>{product.dimensions}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between border-b border-outline-variant/30 pb-sm">
                <span className="font-label-caps text-label-caps">Material</span>
                <span>{product.material}</span>
              </div>
            )}
            <div className="flex justify-between pb-sm">
              <span className="font-label-caps text-label-caps">Status</span>
              <span className="text-primary flex items-center gap-xs">
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
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant text-center opacity-70 text-[11px]">Free shipping on orders over $150</p>
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
            <p className="text-on-surface-variant leading-relaxed">
              {product.material && <>Material: {product.material}<br /></>}
              {product.dimensions && <>Dimensions: {product.dimensions}<br /></>}
              {product.tags?.length > 0 && <>Tags: {product.tags.join(', ')}</>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;



