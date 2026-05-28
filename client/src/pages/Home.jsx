/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImgUrl } from './AdminCategories';

const ProductScroll = ({ title, items }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-container-max mx-auto px-gutter py-xl relative group/scroll">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary">{title}</h2>
        <Link to="/products" className="text-primary font-label-caps text-label-caps border-b border-primary pb-0.5 hover:opacity-70 transition-opacity">View All</Link>
      </div>
      
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-surface/80 backdrop-blur-md p-sm rounded-full shadow-lg border border-outline-variant/30 text-primary opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-primary hover:text-on-primary"
        aria-label="Scroll Left"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-surface/80 backdrop-blur-md p-sm rounded-full shadow-lg border border-outline-variant/30 text-primary opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-primary hover:text-on-primary"
        aria-label="Scroll Right"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-md overflow-x-auto pb-lg no-scrollbar snap-x"
      >
        {items.map(prod => (
          <Link 
            key={prod._id} 
            to={`/products/${prod._id}`} 
            className="flex-shrink-0 w-[240px] md:w-[280px] snap-start group"
          >
            <div className="aspect-square bg-surface-container-low rounded-xl overflow-hidden mb-sm border border-outline-variant/20 relative">
              {prod.onSale && (
                <div className="absolute bottom-sm left-sm z-10 bg-error text-white font-label-caps text-[9px] px-2 py-0.5 rounded shadow-lg">
                  SALE
                </div>
              )}
              <img 
                src={getImgUrl(prod.colorImages?.[0]?.image || prod.image)} 
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute bottom-sm right-sm bg-surface text-primary p-xs rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              </button>
            </div>
            <h3 className="font-headline-md text-[16px] text-primary mb-xs truncate">{prod.name}</h3>
            <div className="flex flex-col">
              <p className="font-body-md text-body-md font-medium text-primary">{formatPrice(prod.price)}</p>
              {prod.onSale && (
                <p className="text-[10px] font-body-md text-on-surface-variant line-through opacity-60">
                  {formatPrice(prod.originalPrice)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);
  const [ethos, setEthos] = useState({
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPYMaiQe0s4wgYylHTX3to9okdYtXdfgL5DEFpiNSIL6WJ2x3SkYnsnYGE_DUCbHaf9ejPgD1DL5kmDz5wCx9af7mJe18jcFDyxhkCPNeMfOeyZ1QDob6ODHDqvbsD9_tYaWRRgL8s9UgB47aSbivKhZlfC1501SaTaUCk3qbkcCWbzZ_pRqZnRtBW2utMKT-S25X3C3COHOG6ETOLiMu9m96bdQRQOfIIxA3ci5688YTOJhR9XveHYJpYxEcN3ukyfB57llzmpU",
    label: "Sustainable by Choice",
    title: "Crafted with Intention",
    description: "Every Loom bag is a testament to mindful creation. We source premium recycled materials to design pieces that endure shifting trends. Our minimalist approach ensures that your bag is not just an accessory, but a staple of your refined, conscious wardrobe."
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);

    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => {
        setBanners(data.banners || []);
        if (data.homeEthos) setEthos(data.homeEthos);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const bestSellers = products.slice(0, 6);
  const bestForJune = products.slice().reverse().slice(0, 6);

  return (
    <div className="flex-grow">
      {/* Auto-scrolling Hero Banner */}
      <section className="relative w-full aspect-[21/9] md:aspect-[3/1] min-h-[400px] overflow-hidden">
        {banners.map((banner, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img src={getImgUrl(banner.image)} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative z-20 w-full max-w-container-max mx-auto px-gutter">
              {/* Content box hidden as requested */}
            </div>
          </div>
        ))}
        {/* Banner Dots */}
        <div className="absolute bottom-md left-1/2 -translate-x-1/2 z-30 flex gap-sm">
          {banners.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentBanner(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentBanner ? 'bg-primary w-6' : 'bg-primary/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <ProductScroll title="Best Sellers" items={bestSellers} />

      {/* Best for June Carousel */}
      <ProductScroll title="Best for June" items={bestForJune} />

      {/* Brand Ethos Section - Retained */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl items-center">
          <div className="order-2 md:order-1">
            <img className="w-full h-auto rounded-xl shadow-sm" alt="Materials" src={getImgUrl(ethos.image)} />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <span className="font-label-caps text-label-caps text-secondary mb-md tracking-wider">{ethos.label}</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">{ethos.title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
              {ethos.description}
            </p>
            <Link to="/about" className="inline-block border border-primary text-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary hover:text-on-primary transition-colors duration-300 self-start">
              Learn About Our Materials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
