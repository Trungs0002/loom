/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImgUrl } from './AdminCategories';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json()).then(d => setFeaturedProducts([...d].reverse().slice(0, 4)))
      .catch(console.error);

    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json()).then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <img
            alt="Loom hero banner"
            className="w-full h-full object-cover object-center opacity-90"
            src="/cover.png"
          />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter py-xxl flex flex-col items-start justify-center">
          <div className="max-w-2xl bg-surface/80 backdrop-blur-sm p-xl rounded-xl border border-outline-variant/30">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-md">
              Recycled Bags, Refined For You
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-lg">
              Discover our collection of sustainably crafted handbags, where timeless luxury meets environmental responsibility. Effortless elegance for the conscious modern woman.
            </p>
            <Link to="/products" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors duration-300 shadow-sm hover:shadow-md">
              Shop Bags
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
                <p className="font-body-md text-body-md text-on-surface-variant">${prod.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Ethos Section */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl items-center">
          <div className="order-2 md:order-1">
            <img className="w-full h-auto rounded-xl object-cover aspect-[4/3] shadow-sm" alt="Materials" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaPYMaiQe0s4wgYylHTX3to9okdYtXdfgL5DEFpiNSIL6WJ2x3SkYnsnYGE_DUCbHaf9ejPgD1DL5kmDz5wCx9af7mJe18jcFDyxhkCPNeMfOeyZ1QDob6ODHDqvbsD9_tYaWRRgL8s9UgB47aSbivKhZlfC1501SaTaUCk3qbkcCWbzZ_pRqZnRtBW2utMKT-S25X3C3COHOG6ETOLiMu9m96bdQRQOfIIxA3ci5688YTOJhR9XveHYJpYxEcN3ukyfB57llzmpU" />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <span className="font-label-caps text-label-caps text-secondary mb-md">Sustainable by Choice</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">Crafted with Intention</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
              Every Loom bag is a testament to mindful creation. We source premium recycled materials to design pieces that endure shifting trends. Our minimalist approach ensures that your bag is not just an accessory, but a staple of your refined, conscious wardrobe.
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
