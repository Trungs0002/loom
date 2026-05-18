/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// Removed hardcoded CATEGORIES

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        setCategories(await res.json());
      } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, []);

  const setCategory = (cat) => {
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const mainImg = (p) => p.colorImages?.[0]?.image || p.image || '';

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl">
      {/* Page Header */}
      <div className="mb-xl text-center">
        <h1 className="font-display-lg text-display-lg hidden md:block mb-sm">
          {activeCategory ? activeCategory.replace(/\b\w/g, c => c.toUpperCase()) : 'All Bags'}
        </h1>
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:hidden mb-sm">
          {activeCategory ? activeCategory.replace(/\b\w/g, c => c.toUpperCase()) : 'All Bags'}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Discover our collection of sustainably crafted minimalist handbags.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-xl pb-md border-b border-outline-variant/30 gap-md">
        {/* Category pills */}
        <div className="flex flex-wrap gap-sm items-center">
          <button
            onClick={() => setCategory('')}
            className={`px-md py-xs rounded-full font-label-caps text-label-caps text-sm border transition-colors ${!activeCategory ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setCategory(cat.name)}
              className={`px-md py-xs rounded-full font-label-caps text-label-caps text-sm border transition-colors capitalize ${activeCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
            >{cat.name}</button>
          ))}
        </div>
        {/* Search + count */}
        <div className="flex items-center gap-md">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-surface border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none w-40"
          />
          <span className="font-body-md text-sm text-on-surface-variant whitespace-nowrap">{filtered.length} results</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {loading ? (
          <div className="col-span-full text-center py-xl text-on-surface-variant">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-xl text-on-surface-variant">No products found.</div>
        ) : (
          filtered.map(product => (
            <div key={product._id} className="group flex flex-col">
              <div className="bg-surface-container-low rounded-xl overflow-hidden mb-md aspect-[4/5] relative">
                <img alt={product.name} src={mainImg(product)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {product.tags?.includes('Sustainable') && (
                  <div className="absolute top-sm left-sm bg-surface-container-high px-sm py-xs rounded font-label-caps text-label-caps text-primary">
                    Sustainable
                  </div>
                )}
                {product.category && (
                  <div className="absolute top-sm right-sm bg-primary/80 backdrop-blur-sm px-sm py-xs rounded font-label-caps text-label-caps text-on-primary text-[10px] capitalize">
                    {product.category}
                  </div>
                )}
              </div>
              <div className="text-center flex-grow flex flex-col">
                <h3 className="font-headline-md text-headline-md mb-xs">{product.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xs">
                  {(product.colorImages?.length ? product.colorImages.map(c => c.color) : product.colors)?.join(', ')}
                </p>
                <p className="font-body-md text-body-md font-medium mb-md">${product.price}</p>
                <Link to={`/products/${product._id}`} className="mt-auto border border-primary text-primary px-lg py-sm rounded-full font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-colors duration-300 w-full max-w-[200px] mx-auto text-center inline-block">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Shop;




