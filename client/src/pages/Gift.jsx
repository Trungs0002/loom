/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImgUrl } from './AdminCategories';

const Gift = () => {
  const [settings, setSettings] = useState({
    banner: "/cover.png",
    product1: null,
    product2: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => {
        if (data.giftPage) {
          setSettings({
            banner: data.giftPage.banner || "/cover.png",
            product1: data.giftPage.product1,
            product2: data.giftPage.product2
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-label-caps">Loading Gift Guide...</div>;

  const renderProduct = (product, isReversed = false, number = "01") => {
    if (!product) return (
      <div className="flex flex-col items-center justify-center p-xxl bg-surface-container rounded-3xl border border-outline-variant/10">
        <p className="font-label-caps text-on-surface-variant tracking-widest opacity-50 text-xs">COLLECTION PIECE {number}</p>
        <p className="font-body-md text-on-surface-variant mt-sm">Select a product in Admin</p>
      </div>
    );

    const bgClass = isReversed ? 'bg-[#FAF9F6]' : 'bg-[#F0F2F5]'; // Alabaster vs Soft Mist
    const accentColor = isReversed ? 'border-[#E2D1C3]' : 'border-[#CBD5E1]';

    return (
      <div className={`relative flex flex-col md:flex-row items-stretch gap-xl md:gap-0 rounded-[40px] overflow-hidden border border-outline-variant/5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ${isReversed ? 'md:flex-row-reverse' : ''} ${bgClass}`}>
        {/* Number Indicator - Moved higher and further to the edge */}
        <div className={`absolute top-md ${isReversed ? 'left-md' : 'right-md'} z-10`}>
          <span className="font-display-lg text-[64px] leading-none opacity-[0.05] pointer-events-none select-none italic">
            {number}
          </span>
        </div>

        {/* Image Section - Framed look for luxury feel */}
        <div className="w-full md:w-1/2 p-md md:p-lg flex items-center justify-center">
          <Link to={`/products/${product._id}`} className="relative block w-full aspect-[4/5] md:aspect-[3/4] rounded-[24px] overflow-hidden group/img shadow-sm bg-white">
            <img
              src={getImgUrl(product.colorImages?.[0]?.image || product.image)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/img:scale-110"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>

        {/* Content Section - Increased top padding for breathing room */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left px-xl py-xxl md:px-[80px]">
          <div className={`w-12 h-[1px] mb-xl ${isReversed ? 'bg-[#E2D1C3]' : 'bg-[#CBD5E1]'}`} />
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-md tracking-[0.2em] uppercase opacity-70">The Curated Edit</p>
          <h2 className="font-display-lg text-display-lg-mobile md:text-[48px] text-primary mb-xl leading-tight">
            {product.name}
          </h2>
          <p className="font-body-lg text-on-surface-variant mb-xxl max-w-sm leading-relaxed italic opacity-80">
            {product.description || "A perfect gift for someone special. Sustainably crafted and timelessly designed for the conscious modern wardrobe."}
          </p>
          <Link
            to={`/products/${product._id}`}
            className="group relative inline-flex items-center gap-md px-xl py-lg bg-primary text-on-primary rounded-full font-label-caps text-label-caps overflow-hidden transition-all duration-300 hover:pr-[72px]"
          >
            <span className="relative z-10">Discover Piece</span>
            <span className="material-symbols-outlined absolute right-[-20px] group-hover:right-lg transition-all duration-300 z-10">arrow_forward</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow bg-white">
      {/* Hero Banner */}
      <section className="relative w-full h-[50vh] md:h-[75vh] overflow-hidden">
        <img
          src={getImgUrl(settings.banner)}
          alt="Gift Guide Banner"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 flex flex-col items-center justify-center text-center px-gutter">
          <p className="font-label-caps text-white text-label-caps tracking-[0.3em] mb-md drop-shadow-sm">CELEBRATING SUSTAINABILITY</p>
          <h1 className="font-display-lg text-display-lg-mobile md:text-[80px] text-white drop-shadow-2xl max-w-4xl">The Art of Giving</h1>
        </div>
      </section>

      {/* Featured Gifts Section */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-[120px] flex flex-col gap-[120px]">
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-primary italic mb-sm">Exclusive Selection</h2>
          <div className="w-20 h-[1px] bg-outline-variant/30 mx-auto" />
        </div>

        {/* Product 1 */}
        {renderProduct(settings.product1, false, "01")}

        {/* Product 2 */}
        {renderProduct(settings.product2, true, "02")}
      </section>

      {/* Extra CTA */}
      <section className="bg-[#FAF9F6] py-[120px] text-center border-t border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-gutter">
          <div className="flex justify-center mb-xl">
            <span className="material-symbols-outlined text-primary/20 text-[48px]">auto_awesome</span>
          </div>
          <h3 className="font-display-lg text-headline-lg text-primary mb-lg">Still searching for the perfect one?</h3>
          <p className="font-body-lg text-on-surface-variant mb-xxl leading-relaxed italic opacity-80">Explore our entire collection of recycled denim bags to find a piece that truly resonates.</p>
          <Link to="/products" className="inline-flex items-center px-[48px] py-lg border border-primary text-primary rounded-full font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-500 tracking-widest">
            EXPLORE ALL PIECES
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Gift;
