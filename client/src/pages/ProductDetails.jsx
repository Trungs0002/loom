/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from './AdminCategories';
import html2canvas from 'html2canvas';

const ProductDetails = () => {
  const { id } = useParams();
  const fabricPreviewRef = useRef(null);
  const placementPreviewRef = useRef(null);
  const mainImageRef = useRef(null); // Ref for auto-scrolling
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Customization States
  const [isCustomized, setIsCustomized] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedIconLeft, setSelectedIconLeft] = useState(null);
  const [selectedIconRight, setSelectedIconRight] = useState(null);
  const [iconPosition, setIconPosition] = useState('before'); // 'before', 'after', 'both'
  const [fontFamily, setFontFamily] = useState('Mrs Saint Delafield');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [isPickingPosition, setIsPickingPosition] = useState(false);
  const [embroideryPos, setEmbroideryPos] = useState({ x: 50, y: 70 });
  const [enlargedPreview, setEnlargedPreview] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const { addToCart } = useCart();
  const { user, favorites, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const embroiderIcons = [
    { id: 'favorite', icon: 'favorite', label: 'Heart' },
    { id: 'star', icon: 'star', label: 'Star' },
    { id: 'auto_awesome', icon: 'auto_awesome', label: 'Sparkle' },
    { id: 'eco', icon: 'eco', label: 'Leaf' },
    { id: 'wb_sunny', icon: 'wb_sunny', label: 'Sun' },
  ];

  const isFavorited = favorites.some(f => (f._id || f) === id);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      return data;
    } catch (error) { 
      console.error(error); 
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const currentProductData = await fetchProduct();
        setSelectedColorIdx(0);
        setIsCustomized(false);
        setCustomName('');
        setSelectedIconLeft(null);
        setSelectedIconRight(null);

        if (currentProductData) {
          const allRes = await fetch(`${API_BASE}/api/products`);
          const allData = await allRes.json();
          const related = allData.filter(p => 
            p._id !== id && 
            p.tags?.some(tag => currentProductData.tags?.includes(tag))
          ).slice(0, 4);
          setRelatedProducts(related);

          // Check if user has purchased this product
          if (user) {
            try {
              const purchaseRes = await fetch(`${API_BASE}/api/orders/check-purchase/${id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              if (purchaseRes.ok) {
                const purchaseData = await purchaseRes.json();
                setHasPurchased(purchaseData.hasPurchased);
              }
            } catch (err) {
              console.error('Error checking purchase status:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
    window.scrollTo(0, 0);
  }, [id, user]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { alert('Please login to write a review'); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        setReviewMessage('Review submitted successfully!');
        setComment(''); setRating(5); setShowReviewForm(false); fetchProduct();
      } else {
        const data = await res.json();
        setReviewMessage(data.message || 'Failed to submit review');
      }
    } catch (err) { setReviewMessage('An error occurred'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="text-center py-xxl text-on-surface-variant">Loading...</div>;
  if (!product) return <div className="text-center py-xxl text-on-surface-variant">Product not found</div>;

  const colorImages = product.colorImages?.length
    ? product.colorImages
    : product.colors?.map(c => ({ color: c, image: product.image })) || [{ color: '', image: product.image }];

  const currentEntry = colorImages[selectedColorIdx] || colorImages[0] || {};
  const currentImage = getImgUrl(currentEntry.image || product.image);
  const currentColor = currentEntry.color;

  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi tới trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }

    setIsAddingToCart(true);
    let customDetails = null;
    
    try {
      if (isCustomized) {
        // 1. Capture previews as base64
        let fabricBase64 = null;
        let placementBase64 = null;
        
        if (fabricPreviewRef.current) {
          const canvas = await html2canvas(fabricPreviewRef.current, {
            useCORS: true,
            scale: 4, // Increased scale for high-res output
            backgroundColor: '#ffffff', // Explicit white background to avoid black edges in JPEG/WebP
            logging: false
          });
          fabricBase64 = canvas.toDataURL('image/webp', 1.0); // High quality WebP
        }
        if (placementPreviewRef.current) {
          const canvas = await html2canvas(placementPreviewRef.current, {
            useCORS: true,
            scale: 4, // Increased scale for high-res output
            backgroundColor: '#ffffff', // Explicit white background
            logging: false
          });
          placementBase64 = canvas.toDataURL('image/webp', 1.0); // High quality WebP
        }

        // 2. Upload to Cloudinary immediately via Server
        let fabricUrl = null;
        let placementUrl = null;

        if (fabricBase64) {
          const res = await fetch(`${API_BASE}/api/upload/base64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ image: fabricBase64 })
          });
          if (res.ok) {
            const data = await res.json();
            fabricUrl = data.url;
          }
        }

        if (placementBase64) {
          const res = await fetch(`${API_BASE}/api/upload/base64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ image: placementBase64 })
          });
          if (res.ok) {
            const data = await res.json();
            placementUrl = data.url;
          }
        }

        customDetails = {
          name: customName || 'LOOM',
          selectedIconLeft: (iconPosition === 'before' || iconPosition === 'both') ? selectedIconLeft : null,
          selectedIconRight: (iconPosition === 'after' || iconPosition === 'both') ? selectedIconRight : null,
          iconPosition,
          fontFamily,
          fontWeight,
          fontStyle,
          embroideryPos,
          customPreviewFabric: fabricUrl,
          customPreviewPlacement: placementUrl
        };
      }

      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        onSale: product.onSale,
        image: currentImage,
        colors: [currentColor],
      }, quantity, customDetails);
      
      alert('Đã thêm vào giỏ hàng với thiết kế của bạn!');
    } catch (err) {
      console.error('Customization process failed:', err);
      alert('Có lỗi xảy ra khi lưu thiết kế. Vui lòng thử lại.');
    } finally {
      setIsAddingToCart(false);
    }
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

  const handleMouseMove = (e) => {
    if (isPickingPosition) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handlePickPosition = (e) => {
    if (!isPickingPosition) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEmbroideryPos({ x, y });
    setIsPickingPosition(false);
  };

  const displayPrice = isCustomized ? product.price + 89000 : product.price;

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xxl mb-xxl">
        {/* Left: Images */}
        <div className="md:col-span-7 flex flex-col gap-gutter">
          <div 
            ref={mainImageRef}
            className={`bg-surface-container-low w-full aspect-square overflow-hidden rounded-xl relative group/zoom ${isPickingPosition ? 'cursor-crosshair' : 'cursor-zoom-in'}`}
            onMouseEnter={() => !isPickingPosition && setIsZooming(true)}
            onMouseLeave={() => !isPickingPosition && setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={(e) => isPickingPosition ? handlePickPosition(e) : setShowFullImage(true)}
          >
            <img
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-200 ease-out ${isZooming ? 'scale-[2.5]' : 'scale-100'}`}
              src={currentImage}
              style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
            />
            
            {/* Pick Position UI */}
            {isPickingPosition && (
              <div className="absolute inset-0 bg-primary/10 border-4 border-primary border-dashed z-30 flex items-center justify-center animate-in fade-in duration-300">
                <div className="bg-primary text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">ads_click</span>
                  Click on the bag to set placement
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/30" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/30" />
              </div>
            )}

            {/* Marker */}
            {isCustomized && !isZooming && (
              <div 
                className="absolute w-8 h-8 border-2 border-white rounded-full bg-primary/40 backdrop-blur-sm z-20 flex items-center justify-center pointer-events-none transition-all duration-500 shadow-lg"
                style={{ left: `${embroideryPos.x}%`, top: `${embroideryPos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            )}

            {isZooming && (
              <div className="absolute bottom-4 left-4 w-32 aspect-square bg-white border border-outline-variant/30 rounded-lg overflow-hidden shadow-2xl z-20 hidden sm:block animate-in fade-in zoom-in-95 duration-200">
                <div className="relative w-full h-full">
                  <img src={currentImage} className="w-full h-full object-cover" alt="minimap" />
                  <div className="absolute border-[1px] border-primary bg-primary/5 pointer-events-none"
                    style={{ width: '40%', height: '40%', left: `${Math.max(0, Math.min(60, zoomPos.x - 20))}%`, top: `${Math.max(0, Math.min(60, zoomPos.y - 20))}%` }} />
                </div>
              </div>
            )}
          </div>
          {colorImages.length > 1 && (
            <div className="flex gap-md">
              {colorImages.map((ci, i) => (
                <button key={i} onClick={() => setSelectedColorIdx(i)}
                  className={`w-20 aspect-square overflow-hidden rounded border-2 transition-all ${i === selectedColorIdx ? 'border-primary' : 'border-transparent hover:border-outline-variant'}`}>
                  <img src={getImgUrl(ci.image)} alt={ci.color} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="md:col-span-5 flex flex-col">
          <div className="mb-xl">
            <div className="flex items-center gap-sm mb-sm">
              <h1 className="font-headline-lg text-headline-lg text-primary">{product.name}</h1>
              {product.onSale && <span className="bg-error text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm tracking-widest uppercase">Sale</span>}
            </div>
            <div className="flex items-baseline gap-md">
              <p className="font-headline-lg text-headline-lg text-on-surface">{formatPrice(product.price)}</p>
              {product.onSale && <p className="font-body-md text-body-md text-on-surface-variant line-through opacity-50">{formatPrice(product.originalPrice)}</p>}
            </div>
          </div>

          {/* Color selector */}
          <div className="mb-lg border-b border-outline-variant/30 pb-lg">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-md text-[10px] font-bold uppercase tracking-widest">Selected Shade: <span className="text-primary">{currentColor}</span></p>
            <div className="flex flex-wrap gap-sm">
              {colorImages.map((ci, i) => (
                <button key={i} onClick={() => setSelectedColorIdx(i)}
                  className={`px-md py-xs rounded-full border font-label-caps text-label-caps text-[11px] transition-all capitalize ${i === selectedColorIdx ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'}`}>
                  {ci.color}
                </button>
              ))}
            </div>
          </div>

          {/* Customization Feature - Redesigned for High Engagement */}
          <div className="mb-xl overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm transition-all duration-500">
            {!isCustomized ? (
              <button 
                onClick={() => setIsCustomized(true)}
                className="w-full p-lg flex items-center justify-between group hover:bg-white transition-all duration-300"
              >
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <span className="material-symbols-outlined text-[24px]">edit_note</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-label-caps text-xs text-primary font-black uppercase tracking-widest">Personalize this piece</h3>
                    <p className="text-[10px] text-on-surface-variant opacity-60 mt-0.5">Add bespoke hand-embroidery (+{formatPrice(89000)})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <span className="font-label-caps text-[9px] font-black uppercase tracking-tighter">Design Now</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </button>
            ) : (
              <div className="p-lg">
                <div className="flex items-center justify-between mb-lg pb-md border-b border-outline-variant/10">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    <span className="font-label-caps text-label-caps text-primary font-bold">Bespoke Configuration</span>
                  </div>
                  <button 
                    onClick={() => setIsCustomized(false)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-error/5 text-on-surface-variant hover:text-error transition-all group"
                  >
                    <span className="font-label-caps text-[9px] font-bold uppercase tracking-tighter">Cancel</span>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>

                <div className="flex flex-col gap-lg animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Personalized Text</label>
                    <input 
                      type="text" 
                      maxLength={10} 
                      value={customName} 
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="Enter text..."
                      className="bg-white border border-outline-variant/50 rounded-xl px-md py-sm text-sm outline-none focus:border-primary shadow-inner font-medium" 
                    />
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg border-t border-outline-variant/20 pt-lg">
                  <div className="flex flex-col gap-md">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Typography</label>
                    <div className="flex bg-white rounded-xl border border-outline-variant/50 p-1">
                      {[
                        { id: 'Mrs Saint Delafield', label: 'Cursive' },
                        { id: 'Playfair Display', label: 'Formal' }
                      ].map(f => (
                        <button key={f.id} onClick={() => setFontFamily(f.id)}
                          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fontFamily === f.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-md">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Enhancements</label>
                    <div className="flex bg-white rounded-xl border border-outline-variant/50 p-1">
                      <button onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fontWeight === 'bold' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                        Bold
                      </button>
                      <button onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fontStyle === 'italic' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                        Italic
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-sm mt-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest font-black">Layout Visualizations</label>
                    <button 
                      onClick={() => {
                        setIsPickingPosition(!isPickingPosition);
                        if (!isPickingPosition) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isPickingPosition ? 'bg-primary text-white border-primary animate-pulse' : 'bg-white text-primary border-primary/30 hover:border-primary hover:shadow-sm'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{isPickingPosition ? 'done_all' : 'ads_click'}</span>
                      {isPickingPosition ? 'Set Placement' : 'Change Location'}
                    </button>
                  </div>
                  
                  {isPickingPosition && (
                    <p className="text-[9px] text-primary font-bold italic text-center animate-bounce mb-2">Click on the bag image above to set position!</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    {/* View 1: High Detail Fabric Zoom */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest px-1">Detailed Fabric View</span>
                      <div 
                        className="aspect-square w-full bg-surface-container rounded-2xl border border-outline-variant/10 relative overflow-hidden shadow-lg group/preview cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => setEnlargedPreview('fabric')}
                      >
                        {/* Square Inner Container for Capture (No rounding here) */}
                        <div ref={fabricPreviewRef} id="fabric-preview-box" className="w-full h-full relative flex items-center justify-center">
                          <div 
                            className="absolute inset-0 transition-all duration-1000 ease-in-out group-hover/preview:scale-105"
                            style={{ 
                              backgroundImage: `url(${currentImage})`,
                              backgroundPosition: `${(6 * embroideryPos.x - 50) / 5}% ${(6 * embroideryPos.y - 50) / 5}%`,
                              backgroundSize: '600%'
                            }}
                          />
                          
                          <div className="relative z-10 flex items-center gap-2 animate-in zoom-in-95 duration-500 text-white scale-75 md:scale-110">
                            {(iconPosition === 'before' || iconPosition === 'both') && selectedIconLeft && (
                              <span className="material-symbols-outlined text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{selectedIconLeft}</span>
                            )}
                            <span 
                              className={`text-4xl md:text-5xl tracking-wide drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]`}
                              style={{ 
                                fontFamily: fontFamily === 'Mrs Saint Delafield' ? "'Mrs Saint Delafield', cursive" : "'Playfair Display', serif",
                                fontWeight: fontWeight,
                                fontStyle: fontStyle,
                                lineHeight: 1
                              }}
                            >
                              {customName || 'Loom'}
                            </span>
                            {(iconPosition === 'after' || iconPosition === 'both') && selectedIconRight && (
                              <span className="material-symbols-outlined text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{selectedIconRight}</span>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                        </div>
                      </div>
                    </div>

                    {/* View 2: Full Bag Placement */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest px-1">Overall Placement</span>
                      <div 
                        className="aspect-square w-full bg-surface-container rounded-2xl border border-outline-variant/10 relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group/preview2"
                        onClick={() => setEnlargedPreview('placement')}
                      >
                        {/* Square Inner Container for Capture (No rounding here) */}
                        <div ref={placementPreviewRef} id="placement-preview-box" className="w-full h-full relative flex items-center justify-center">
                          <img src={currentImage} className="w-full h-full object-cover transition-transform duration-500 group-hover/preview2:scale-105" alt="bag placement" />
                          
                          <div 
                            className="absolute z-10 flex items-center gap-1.5 text-white pointer-events-none transition-all duration-500"
                            style={{ 
                              left: `${embroideryPos.x}%`, 
                              top: `${embroideryPos.y}%`, 
                              transform: 'translate(-50%, -50%) scale(0.25)', 
                              transformOrigin: 'center center'
                            }}
                          >
                            {(iconPosition === 'before' || iconPosition === 'both') && selectedIconLeft && (
                              <span className="material-symbols-outlined text-2xl">{selectedIconLeft}</span>
                            )}
                            <span 
                              className={`text-4xl md:text-5xl tracking-wide whitespace-nowrap`}
                              style={{ 
                                fontFamily: fontFamily === 'Mrs Saint Delafield' ? "'Mrs Saint Delafield', cursive" : "'Playfair Display', serif",
                                fontWeight: fontWeight,
                                fontStyle: fontStyle,
                                lineHeight: 1
                              }}
                            >
                              {customName || 'Loom'}
                            </span>
                            {(iconPosition === 'after' || iconPosition === 'both') && selectedIconRight && (
                              <span className="material-symbols-outlined text-2xl">{selectedIconRight}</span>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/preview2:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="mt-md p-md bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest opacity-60">Service Fee</span>
                  <span className="font-headline-lg text-lg text-primary font-bold tracking-tight">+ {formatPrice(89000)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Add to cart */}
          <div className="flex gap-lg mt-auto mb-md">
            <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-lg py-sm hover:bg-surface-container transition-colors text-primary font-bold">−</button>
              <span className="px-md font-body-md text-primary font-bold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-lg py-sm hover:bg-surface-container transition-colors text-primary font-bold">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0 || isAddingToCart}
              className={`flex-grow font-label-caps text-label-caps py-md rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-primary text-on-primary hover:bg-[#081F5C] active:scale-95' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}>
              {isAddingToCart ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Syncing Design...
                </>
              ) : (
                product.stock > 0 ? 'Add to Cart' : 'Out of Stock'
              )}
            </button>
            <button onClick={handleToggleFavorite} className={`px-md py-sm border border-outline-variant rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center ${isFavorited ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant text-center opacity-60 text-[10px] uppercase tracking-widest font-black">Free shipping on premium orders over 500.000 VND</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-xxl pt-xl border-t border-outline-variant/20">
        <div className="flex gap-xl border-b border-outline-variant/20 mb-lg">
          {['Description', 'Details', 'Reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-label-caps text-label-caps pb-sm transition-colors uppercase tracking-widest font-bold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="max-w-3xl py-md text-sm leading-relaxed text-on-surface-variant">
          {activeTab === 'Description' && <p>{product.description || '—'}</p>}
          {activeTab === 'Details' && (
            <div className="space-y-md">
              {product.material && <p><span className="font-bold text-primary uppercase text-[10px] tracking-widest mr-2">Material:</span> {product.material}</p>}
              {product.innerLining && <p><span className="font-bold text-primary uppercase text-[10px] tracking-widest mr-2">Inner lining:</span> {product.innerLining}</p>}
              {product.dimensions && <p><span className="font-bold text-primary uppercase text-[10px] tracking-widest mr-2">Size:</span> {product.dimensions}</p>}
              {product.careInstructions && <p><span className="font-bold text-primary uppercase text-[10px] tracking-widest mr-2">Care:</span> {product.careInstructions}</p>}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div className="space-y-xl">
               <div className="flex flex-col md:flex-row md:items-center gap-xl mb-xl p-lg bg-surface-container-low rounded-3xl">
                <div className="text-center md:text-left">
                  <div className="text-6xl font-black text-primary tracking-tighter mb-xs">{product.rating?.toFixed(1) || '0.0'}</div>
                  <div className="flex gap-xs justify-center md:justify-start text-primary mb-2">
                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: star <= product.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>)}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">{product.numReviews || 0} reviews verified</p>
                </div>
                <div className="h-px w-full md:w-px md:h-20 bg-outline-variant/30 hidden md:block"></div>
                <div className="flex-grow">
                  {!user ? (
                    <div className="text-center md:text-left">
                      <p className="font-label-caps text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 mb-2">Login to share your experience</p>
                      <button onClick={() => navigate('/login')} className="bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-[#081F5C] shadow-lg transition-all uppercase tracking-widest font-black text-[11px]">Login to Review</button>
                    </div>
                  ) : !hasPurchased ? (
                    <div className="text-center md:text-left">
                      <p className="font-label-caps text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 mb-2">Exclusive for verified owners</p>
                      <button disabled className="bg-outline-variant text-on-surface-variant cursor-not-allowed font-label-caps text-label-caps px-xl py-md rounded-full uppercase tracking-widest font-black text-[11px]">Purchase to review</button>
                    </div>
                  ) : !showReviewForm ? (
                    <button onClick={() => setShowReviewForm(true)} className="bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-[#081F5C] shadow-lg transition-all uppercase tracking-widest font-black text-[11px]">Write Experience</button>
                  ) : (
                    <form onSubmit={submitReview} className="flex flex-col gap-md animate-in fade-in duration-500">
                      <div className="flex items-center gap-md">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Rate Asset:</span>
                        <div className="flex gap-1 text-primary">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setRating(star)} className="hover:scale-125 transition-transform"><span className="material-symbols-outlined" style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}>star</span></button>
                          ))}
                        </div>
                      </div>
                      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe your experience with this LOOM creation..." className="w-full bg-white border border-outline-variant/50 rounded-2xl p-md text-sm outline-none focus:border-primary shadow-inner min-h-[100px] resize-none" required />
                      <div className="flex gap-md">
                        <button type="submit" disabled={submittingReview} className="bg-primary text-on-primary font-label-caps text-[10px] font-black uppercase tracking-widest px-lg py-3 rounded-full flex-grow">{submittingReview ? 'Syncing...' : 'Publish Review'}</button>
                        <button type="button" onClick={() => setShowReviewForm(false)} className="px-lg text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:underline">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              {product.reviews?.map((rev, i) => (
                <div key={i} className="border-b border-outline-variant/10 pb-lg last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-primary uppercase text-sm tracking-tight">{rev.name}</p>
                      <div className="flex gap-0.5 text-primary mt-1">
                        {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: star <= rev.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>)}
                      </div>
                    </div>
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm italic opacity-80 leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-xxl pt-xxl border-t border-outline-variant/20">
          <h2 className="font-headline-lg text-2xl text-primary mb-xl font-black uppercase tracking-tighter">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-xl">
            {relatedProducts.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="group space-y-4">
                <div className="bg-surface-container-low rounded-2xl overflow-hidden aspect-[4/5] relative border border-outline-variant/10 shadow-sm transition-all group-hover:shadow-xl group-hover:border-primary/20">
                  <img alt={p.name} src={getImgUrl(p.colorImages?.[0]?.image || p.image || '')} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-sm text-primary uppercase tracking-tight truncate">{p.name}</h3>
                  <p className="text-xs font-bold text-on-surface-variant opacity-60 tracking-tighter">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showFullImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-md animate-in fade-in duration-500" onClick={() => setShowFullImage(false)}>
          <button className="absolute top-xl right-xl text-white hover:rotate-90 transition-all duration-300"><span className="material-symbols-outlined text-4xl">close</span></button>
          <img src={currentImage} alt={product.name} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Enlarged Customization Previews */}
      {enlargedPreview && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-md md:p-xl animate-in fade-in duration-500" onClick={() => setEnlargedPreview(null)}>
          <button className="absolute top-xl right-xl text-white hover:rotate-90 transition-all duration-300"><span className="material-symbols-outlined text-4xl">close</span></button>
          
          <div className="w-full max-w-4xl aspect-square bg-surface-container rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
            {enlargedPreview === 'fabric' ? (
              <>
                <div 
                  className="absolute inset-0 transition-all duration-1000 ease-in-out"
                  style={{ 
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${(6 * embroideryPos.x - 50) / 5}% ${(6 * embroideryPos.y - 50) / 5}%`,
                    backgroundSize: '600%'
                  }}
                />
                <div className="relative z-10 flex items-center gap-4 text-white scale-150">
                  {(iconPosition === 'before' || iconPosition === 'both') && selectedIconLeft && (
                    <span className="material-symbols-outlined text-4xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">{selectedIconLeft}</span>
                  )}
                  <span 
                    className={`text-6xl md:text-7xl tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]`}
                    style={{ 
                      fontFamily: fontFamily === 'Mrs Saint Delafield' ? "'Mrs Saint Delafield', cursive" : "'Playfair Display', serif",
                      fontWeight: fontWeight,
                      fontStyle: fontStyle,
                      lineHeight: 1
                    }}
                  >
                    {customName || 'Loom'}
                  </span>
                  {(iconPosition === 'after' || iconPosition === 'both') && selectedIconRight && (
                    <span className="material-symbols-outlined text-4xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">{selectedIconRight}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <img src={currentImage} className="w-full h-full object-cover" alt="bag placement" />
                <div 
                  className="absolute z-10 flex items-center gap-2 text-white pointer-events-none"
                  style={{ 
                    left: `${embroideryPos.x}%`, 
                    top: `${embroideryPos.y}%`, 
                    transform: 'translate(-50%, -50%) scale(0.5)', // Larger scale for fullscreen view
                    transformOrigin: 'center center'
                  }}
                >
                  {(iconPosition === 'before' || iconPosition === 'both') && selectedIconLeft && (
                    <span className="material-symbols-outlined text-4xl">{selectedIconLeft}</span>
                  )}
                  <span 
                    className={`text-6xl md:text-7xl tracking-wide whitespace-nowrap`}
                    style={{ 
                      fontFamily: fontFamily === 'Mrs Saint Delafield' ? "'Mrs Saint Delafield', cursive" : "'Playfair Display', serif",
                      fontWeight: fontWeight,
                      fontStyle: fontStyle,
                      lineHeight: 1
                    }}
                  >
                    {customName || 'Loom'}
                  </span>
                  {(iconPosition === 'after' || iconPosition === 'both') && selectedIconRight && (
                    <span className="material-symbols-outlined text-4xl">{selectedIconRight}</span>
                  )}
                </div>
              </>
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-xs uppercase tracking-widest">
              {enlargedPreview === 'fabric' ? 'High Detail View' : 'Full Bag Placement'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
