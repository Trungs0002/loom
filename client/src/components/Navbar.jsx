import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const isAdminUser = user && user.role === 'admin';

  return (
    <header className="bg-white/90 dark:bg-surface-dim/90 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-gutter py-md w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="font-headline-lg text-headline-lg tracking-widest text-[#081F5C] hover:opacity-70 transition-opacity duration-300">
          LOOM
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-lg items-center">
          <Link to="/" className={`font-label-caps text-label-caps transition-colors ${path === '/' ? 'text-[#081F5C] border-b-2 border-[#081F5C] pb-1' : 'text-on-surface-variant hover:text-[#081F5C]'}`}>
            Home
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
            <button onClick={logout} className="font-label-caps text-label-caps transition-colors text-on-surface-variant hover:text-[#081F5C]">
              Logout
            </button>
          ) : (
            <Link to="/login" className="font-label-caps text-label-caps transition-colors text-on-surface-variant hover:text-[#081F5C]">
              Login
            </Link>
          )}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-md">
          <Link to="/cart" aria-label="shopping_bag" className="text-[#081F5C] hover:opacity-70 transition-opacity duration-300 active:scale-95">
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
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">About</Link>
          {isAdminUser && (
            <Link to="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Admin</Link>
          )}
          {user ? (
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Logout</button>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-[#081F5C]">Login</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
