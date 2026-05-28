
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, favorites } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isAdminUser = user && user.role === 'admin';

  return (
    <header className="bg-white/90 dark:bg-surface-dim/90 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-gutter py-md w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-sm hover:opacity-80 transition-opacity duration-300">
          <img src="/avatar.png" alt="Loom" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-headline-lg text-headline-lg tracking-widest text-[#081F5C]">LOOM</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-lg items-center">
          <Link to="/" className={`font-label-caps text-label-caps transition-colors ${path === '/' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
            Home
          </Link>
          <Link to="/collection" className={`font-label-caps text-label-caps transition-colors ${path === '/collection' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
            Collection
          </Link>
          <Link to="/gift" className={`font-label-caps text-label-caps transition-colors ${path === '/gift' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
            Gift
          </Link>
          <Link to="/about" className={`font-label-caps text-label-caps transition-colors ${path === '/about' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
            About
          </Link>
          {isAdminUser && (
            <Link to="/admin/products" className={`font-label-caps text-label-caps transition-colors ${path === '/admin/products' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
              Admin
            </Link>
          )}
          {user ? (
            <Link to="/profile" className={`font-label-caps text-label-caps transition-colors ${path === '/profile' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
              Profile
            </Link>
          ) : (
            <Link to="/login" className="font-label-caps text-label-caps transition-colors text-on-surface-variant hover:text-[#081F5C]">
              Login
            </Link>
          )}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-sm md:gap-md">
          {/* Search */}
          <div className="relative flex items-center">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute right-full mr-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/50 rounded-full px-md py-xs text-sm text-on-surface focus:border-primary outline-none w-48 md:w-64"
                />
              </form>
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              aria-label="search" 
              className="text-[#081F5C] p-sm rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">{isSearchOpen ? 'close' : 'search'}</span>
            </button>
          </div>

          {/* Favourite */}
          <Link 
            to="/favorites" 
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                if (window.confirm('Bạn cần đăng nhập để xem danh sách yêu thích. Đi tới trang đăng nhập?')) {
                  navigate('/login');
                }
              }
            }} 
            aria-label="favorite" 
            className="text-[#081F5C] p-sm rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: favorites.some(f => f) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-on-primary text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-surface-dim">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link 
            to="/cart" 
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                if (window.confirm('Bạn cần đăng nhập để xem giỏ hàng. Đi tới trang đăng nhập?')) {
                  navigate('/login');
                }
              }
            }} 
            aria-label="shopping_bag" 
            className="text-[#081F5C] p-sm rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 flex items-center justify-center"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
          </Link>
          {/* Mobile Menu Toggle */}
          <button
            aria-label="Menu"
            className="md:hidden text-[#081F5C] hover:opacity-70 transition-opacity duration-300 active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dim border-t border-outline-variant/20 px-gutter py-md flex flex-col gap-md">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Home</Link>
          <Link to="/collection" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Collection</Link>
          <Link to="/gift" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Gift</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">About</Link>
          {isAdminUser && (
            <Link to="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Admin</Link>
          )}
          {user ? (
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Profile</Link>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Login</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

