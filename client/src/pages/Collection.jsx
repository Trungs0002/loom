/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImgUrl } from './AdminCategories';

const Collection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json()).then(d => setFeaturedProducts([...d].reverse().slice(0, 8)))
      .catch(console.error);

    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json()).then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <img
            alt="Loom collection banner"
            className="w-full h-full object-cover object-center opacity-80"
            src="/cover.png"
          />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter py-xxl flex flex-col items-center text-center">
          <div className="max-w-2xl bg-surface/80 backdrop-blur-sm p-xl rounded-xl border border-outline-variant/30">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-md">
              LOOM's Collection
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto mb-xl">
              A curated selection of recycled, refined, and responsibly crafted handbags for the conscious modern woman.
            </p>
            <Link to="/products" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors duration-300 shadow-sm hover:shadow-md">
              Shop All Bags
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">Shop by Category</h2>
          <div className="w-16 h-px bg-primary mx-auto opacity-30"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {categories.length === 0
            ? [1,2,3,4].map(i => (
                <div key={i} className="animate-pulse rounded-xl aspect-[3/4] bg-surface-container" />
              ))
            : categories.map((cat) => (
              <Link key={cat._id} to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-xl aspect-[3/4] block bg-surface-container hover:shadow-lg transition-shadow duration-300 border border-outline-variant/10">
                {cat.image
                  ? <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={cat.name} src={getImgUrl(cat.image)} />
                  : <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30">category</span>
                    </div>}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-lg">
                  <h3 className="font-headline-md text-headline-md text-on-primary capitalize">{cat.name}</h3>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl bg-surface-container-low rounded-[2rem] my-xxl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">Featured Arrivals</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Our latest silhouettes, consciously designed for effortless daily wear.</p>
          </div>
          <Link to="/products" className="font-label-caps text-label-caps text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {featuredProducts.map(prod => (
            <Link key={prod._id} to={`/products/${prod._id}`} className="group flex flex-col cursor-pointer">
              <div className="relative w-full aspect-[4/5] bg-surface-container rounded-xl overflow-hidden mb-md border border-outline-variant/20">
                {prod.tags && prod.tags.includes('New') && <div className="absolute top-sm left-sm bg-surface/90 text-primary font-label-caps text-[10px] px-2 py-1 rounded-full z-10">New</div>}
                <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt={prod.name} src={getImgUrl(prod.colorImages?.[0]?.image || prod.image)} />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
                <button className="absolute bottom-md right-md bg-surface text-primary p-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                </button>
              </div>
              <div className="flex flex-col text-center">
                <h3 className="font-headline-md text-[18px] text-primary mb-xs">{prod.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{formatPrice(prod.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Collection;
