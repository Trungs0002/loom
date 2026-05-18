import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import { AdminProducts, AdminOrders } from './pages/AdminDashboard';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Hide default Navbar for Admin and Auth pages */}
      {!isAdmin && !isAuth && <Navbar />}
      
      {/* Auth specific minimalist header */}
      {isAuth && (
        <header className="w-full flex justify-center py-xl bg-transparent absolute top-0 left-0 right-0 z-10">
          <a href="/" className="font-headline-lg text-headline-lg tracking-widest text-primary">LOOM</a>
        </header>
      )}

      {children}
      
      {/* Hide default Footer for Admin page (Admin has its own layout) */}
      {!isAdmin && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Shop />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </AppLayout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
