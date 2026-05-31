/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from './AdminCategories';

// Removed hardcoded CATEGORIES

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const activeBagType = searchParams.get('bagType') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || '';
  const initialPriceRange = searchParams.get('priceRange') || '';
  const [search, setSearch] = useState(initialSearch);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [bagType, setBagType] = useState(activeBagType);
  const [categories, setCategories] = useState([]);
  const { user, favorites, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under 500,000 VND', value: '0-500000' },
    { label: '500,000 - 1,000,000 VND', value: '500000-1000000' },
    { label: '1,000,000 - 2,000,000 VND', value: '1000000-2000000' },
    { label: 'Over 2,000,000 VND', value: '2000000-999999999' },
  ];

  // Dynamic bag types from tags - Only include tags ending with "bag" AND having >= 3 products
  const bagTagCounts = products.flatMap(p => p.tags || [])
    .filter(tag => tag.toLowerCase().endsWith('bag'))
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  const bagTypes = Object.keys(bagTagCounts)
    .filter(tag => bagTagCounts[tag] >= 3)
    .sort();

  // Sync state with searchParams
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSortOrder(searchParams.get('sort') || '');
    setPriceRange(searchParams.get('priceRange') || '');
    setBagType(searchParams.get('bagType') || '');
  }, [searchParams]);

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

  const updateSearchParams = (newParams) => {
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    if (sortOrder) params.sort = sortOrder;
    if (priceRange) params.priceRange = priceRange;
    if (bagType) params.bagType = bagType;
    
    setSearchParams({ ...params, ...newParams });
  };

  const setCategory = (cat) => {
    updateSearchParams({ category: cat });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    updateSearchParams({ search: val });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortOrder(val);
    updateSearchParams({ sort: val });
  };

  const handlePriceRangeChange = (e) => {
    const val = e.target.value;
    setPriceRange(val);
    updateSearchParams({ priceRange: val });
  };

  const handleBagTypeChange = (e) => {
    const val = e.target.value;
    setBagType(val);
    updateSearchParams({ bagType: val });
  };

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchBagType = !bagType || p.tags?.some(t => t.toLowerCase() === bagType.toLowerCase());
    
    let matchPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      matchPrice = p.price >= min && p.price <= max;
    }
    
    return matchCat && matchSearch && matchPrice && matchBagType;
  });

  // Apply Sorting
  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0; // Default: as returned by API
  });

  const mainImg = (p) => getImgUrl(p.colorImages?.[0]?.image || p.image || '');

  const isFavorited = (id) => favorites.some(f => (f._id || f) === id);

  const handleToggleFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào danh sách yêu thích. Đi tới trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }
    await toggleFavorite(productId);
  };

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
        <div className="flex flex-wrap items-center gap-md">
          <select
            value={bagType}
            onChange={handleBagTypeChange}
            className="bg-surface border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none cursor-pointer capitalize"
          >
            <option value="">All Types</option>
            {bagTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={priceRange}
            onChange={handlePriceRangeChange}
            className="bg-surface border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none cursor-pointer"
          >
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="bg-surface border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none cursor-pointer"
          >
            <option value="">Sort by (Default)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="bg-surface border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none w-40"
          />
          <span className="font-body-md text-sm text-on-surface-variant whitespace-nowrap">{sortedAndFiltered.length} results</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
        {loading ? (
          <div className="col-span-full text-center py-xl text-on-surface-variant">Loading products...</div>
        ) : sortedAndFiltered.length === 0 ? (
          <div className="col-span-full text-center py-xl text-on-surface-variant">No products found.</div>
        ) : (
          sortedAndFiltered.map(product => (
            <div key={product._id} className="group flex flex-col relative">
              <div className="bg-surface-container-low rounded-xl overflow-hidden mb-md aspect-[4/5] relative">
                {product.onSale && (
                  <div className="absolute bottom-sm left-sm z-10 bg-error text-white font-label-caps text-[9px] px-2 py-0.5 rounded shadow-lg">
                    SALE
                  </div>
                )}
                <img alt={product.name} src={mainImg(product)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Favorite Button */}
                <button 
                  onClick={(e) => handleToggleFavorite(e, product._id)}
                  className="absolute top-sm left-sm bg-white/80 backdrop-blur-sm p-xs rounded-full shadow-md z-10 hover:bg-white transition-colors"
                  aria-label="Toggle Favorite"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isFavorited(product._id) ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}
                        style={{ fontVariationSettings: isFavorited(product._id) ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                </button>

                {product.tags?.includes('Sustainable') && (
                  <div className="absolute bottom-sm left-sm bg-surface-container-high px-sm py-xs rounded font-label-caps text-label-caps text-primary">
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
                <div className="flex flex-col items-center mb-md">
                  <p className="font-body-md text-body-md font-medium text-primary">{formatPrice(product.price)}</p>
                  {product.onSale && (
                    <p className="text-[10px] font-body-md text-on-surface-variant line-through opacity-60">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </div>
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
