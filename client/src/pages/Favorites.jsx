
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from './AdminCategories';

const Favorites = () => {
  const { favorites, toggleFavorite } = useAuth();

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl">
      <div className="mb-xxl text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">My Favorites</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Items you've saved for later</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-xxl bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md block">favorite_border</span>
          <p className="font-body-lg text-on-surface-variant mb-xl">Your favorites list is empty.</p>
          <Link to="/products" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded hover:opacity-90 transition-opacity">
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl">
          {favorites.map((product) => {
            // Support both populated and ID-only favorites (though they should be populated here)
            if (typeof product === 'string') return null;
            
            return (
              <div key={product._id} className="group flex flex-col bg-white dark:bg-surface-dim rounded-xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Link to={`/products/${product._id}`}>
                    <img 
                      src={getImgUrl(product.colorImages?.[0]?.image || product.image)} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button 
                    onClick={() => toggleFavorite(product._id)}
                    className="absolute top-md right-md bg-white/80 backdrop-blur-sm p-sm rounded-full text-primary hover:bg-primary hover:text-on-primary transition-all duration-300 shadow-md"
                    aria-label="Remove from favorites"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
                
                <div className="p-lg flex flex-col flex-grow">
                  <div className="mb-md">
                    <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase">{product.category}</span>
                    <Link to={`/products/${product._id}`} className="block">
                      <h3 className="font-headline-sm text-headline-sm text-primary hover:text-primary/80 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">${product.price}</span>
                    <Link 
                      to={`/products/${product._id}`}
                      className="text-primary font-label-caps text-label-caps hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
