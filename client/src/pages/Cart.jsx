import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../config';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [enlargedImage, setEnlargedImage] = useState(null);
  const total = getCartTotal();

  // Detailed Breakdown Calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + (item.basePrice || 0) * item.quantity, 0);
  const totalCustomFees = cartItems.reduce((acc, item) => acc + (item.customFee || 0) * item.quantity, 0);
  
  // Savings are calculated based on original product price vs current product price
  const originalItemsSubtotal = cartItems.reduce((acc, item) => {
    const originalPrice = item.onSale ? (item.originalPrice || item.basePrice) : item.basePrice;
    return acc + originalPrice * item.quantity;
  }, 0);
  const savings = originalItemsSubtotal - itemsSubtotal;

  const shippingCost = total > 500000 ? 0 : 30000;
  const orderTotal = total + shippingCost;

  return (
    <main className="w-full max-w-container-max mx-auto px-gutter py-xxl flex flex-col gap-xxl min-h-screen">
      <header className="flex flex-col gap-sm pt-8">
        <h1 className="font-display-lg text-display-lg hidden md:block text-primary">Your Cart</h1>
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:hidden text-primary">Your Cart</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{cartItems.length} items securely reserved for checkout.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl">
        <section className="lg:col-span-8 flex flex-col gap-xl">
          <div className="hidden md:grid grid-cols-12 gap-md pb-md border-b border-outline-variant/30 font-label-caps text-label-caps text-on-surface-variant">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-xl text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/50">
              <p className="text-on-surface-variant font-body-md text-body-md mb-md">Your cart is empty.</p>
              <Link to="/products" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary-container transition-colors">Continue Shopping</Link>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <article key={idx} className="flex flex-col py-lg border-b border-outline-variant/30 relative group">
                <div className="flex flex-col md:grid md:grid-cols-12 gap-md items-start md:items-center w-full">
                  <div className="col-span-6 flex gap-lg w-full">
                    <div className="w-24 h-32 md:w-32 md:h-40 bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/20 relative flex-shrink-0">
                      {item.onSale && (
                        <span className="absolute top-2 left-2 bg-error text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">SALE</span>
                      )}
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        src={item.image} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs justify-center">
                      <h3 className="font-headline-md text-headline-md text-primary">{item.name}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">{item.color}</p>
                      
                      {/* Price for Mobile */}
                      <div className="flex items-center gap-sm mt-1 md:hidden">
                        <p className="font-body-md text-body-md text-primary font-medium">{formatPrice(item.basePrice)}</p>
                        {item.onSale && (
                          <p className="font-body-md text-xs text-on-surface-variant line-through opacity-50">
                            {formatPrice(item.originalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-start md:justify-center w-full mt-md md:mt-0">
                    <div className="flex items-center border border-outline-variant/50 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="p-sm text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                      </button>
                      <span className="font-body-md text-body-md text-primary w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="p-sm text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-between md:justify-end w-full mt-md md:mt-0">
                    <div className="flex flex-col items-end">
                      {/* Row Total (Bag Only) */}
                      <p className="font-body-md text-body-md text-primary hidden md:block font-medium">{formatPrice(item.basePrice * item.quantity)}</p>
                      {item.onSale && (
                        <p className="font-body-md text-[10px] text-on-surface-variant line-through opacity-50 hidden md:block">
                          {formatPrice((item.originalPrice || item.basePrice) * item.quantity)}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-on-surface-variant hover:text-error transition-colors md:ml-lg flex items-center gap-xs p-2 rounded-full hover:bg-error/5">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                      <span className="font-label-caps text-label-caps md:hidden">Remove</span>
                    </button>
                  </div>
                </div>

                {/* LOOM Integrated Customization Detail - Simplified & Clean */}
                {item.isCustomized && (
                  <div className="mt-6 ml-0 md:ml-32 lg:ml-40 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
                    <div className="flex flex-col gap-6">
                      {/* Personalization Summary */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase opacity-60">Personalization</span>
                          <div className="flex items-center gap-3 text-primary">
                            {item.selectedIconLeft && <span className="material-symbols-outlined text-[20px] opacity-50">{item.selectedIconLeft}</span>}
                            <span 
                              className={`text-2xl md:text-3xl ${item.fontFamily === 'Mrs Saint Delafield' ? 'font-signature' : 'font-formal'}`}
                              style={{ fontWeight: item.fontWeight, fontStyle: item.fontStyle }}
                            >
                              {item.customName}
                            </span>
                            {item.selectedIconRight && <span className="material-symbols-outlined text-[20px] opacity-50">{item.selectedIconRight}</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="font-label-caps text-[9px] text-on-surface-variant/70 uppercase">Font: {item.fontFamily === 'Mrs Saint Delafield' ? 'Cursive' : 'Formal'}</span>
                            {(item.fontWeight === 'bold' || item.fontStyle === 'italic') && (
                              <span className="font-label-caps text-[9px] text-on-surface-variant/70 uppercase">
                                Enhancements: {[item.fontWeight === 'bold' && 'Bold', item.fontStyle === 'italic' && 'Italic'].filter(Boolean).join(' & ')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end justify-center">
                          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase opacity-60 block">Custom Fee</span>
                          <p className="font-body-md text-body-md text-primary font-medium">+ {formatPrice(item.customFee)}</p>
                        </div>
                      </div>
                      
                      {/* ... rest of preview ... */}

                      {/* Preview Thumbnails - Perfectly Flat & Filled */}
                      <div className="flex gap-4">
                        {[
                          { url: item.customPreviewFabric, label: 'Detail' },
                          { url: item.customPreviewPlacement, label: 'Placement' }
                        ].map((img, i) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            <div 
                              className="w-20 h-20 rounded-xl overflow-hidden cursor-zoom-in hover:opacity-80 transition-all shadow-none bg-white"
                              onClick={() => setEnlargedImage(img.url)}
                            >
                              {img.url ? (
                                <img src={img.url} className="w-full h-full object-cover block border-0 m-0 p-0" alt={img.label} />
                              ) : (
                                <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-outline-variant/30">
                                  <span className="material-symbols-outlined text-[20px]">image</span>
                                </div>
                              )}
                            </div>
                            <span className="font-label-caps text-[8px] text-on-surface-variant uppercase text-center opacity-40 tracking-widest">{img.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        <aside className="lg:col-span-4 mt-xl lg:mt-0">
          <div className="bg-surface-container-low p-xl flex flex-col gap-lg rounded-3xl border border-outline-variant/30 sticky top-24">
            <h2 className="font-headline-md text-headline-md text-primary border-b border-outline-variant/30 pb-md">Order Summary</h2>
            <div className="flex flex-col gap-md">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Items Subtotal</span>
                <span>{formatPrice(itemsSubtotal)}</span>
              </div>
              
              {totalCustomFees > 0 && (
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>Customization Fees</span>
                  <span>{formatPrice(totalCustomFees)}</span>
                </div>
              )}

              {savings > 0 && (
                <div className="flex justify-between items-center font-body-md text-body-md text-error">
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">sell</span>
                    Sale Discounts
                  </span>
                  <span>-{formatPrice(savings)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center font-headline-md text-headline-md text-[#081F5C]">
              <span>Order Total</span>
              <span className="text-2xl font-bold">{formatPrice(orderTotal)}</span>
            </div>

            <Link to={cartItems.length > 0 ? "/checkout" : "#"} className={`w-full font-label-caps text-label-caps py-md mt-sm transition-colors duration-300 flex justify-center items-center gap-sm group ${cartItems.length > 0 ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}>
              Proceed to Checkout
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* Enlarged Image Modal - Flat look as requested */}
      {enlargedImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 animate-in fade-in duration-500" onClick={() => setEnlargedImage(null)}>
          <button className="absolute top-10 right-10 text-white hover:rotate-90 transition-all duration-300 font-bold z-[210]"><span className="material-symbols-outlined text-4xl">close</span></button>
          <img src={enlargedImage} alt="Enlarged design" className="w-full h-full object-contain animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </main>
  );
};

export default Cart;
