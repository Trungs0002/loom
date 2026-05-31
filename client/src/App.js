import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import Gift from './pages/Gift';
import Profile from './pages/Profile';
import { AdminProducts, AdminOrders, AdminUsers, AdminAnalytics } from './pages/AdminDashboard';
import { AdminCategories } from './pages/AdminCategories';
import { AdminHome } from './pages/AdminHome';

// New Pages
import Sustainability from './pages/Sustainability';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import { 
  ShippingPolicy, 
  ReturnPolicy, 
  CareInstructions, 
  SizeGuide, 
  PaymentMethods 
} from './pages/Policies';

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
          <ScrollToTop />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Shop />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/gift" element={<Gift />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/dashboard" element={<AdminAnalytics />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/home" element={<AdminHome />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              {/* Info Pages */}
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/care-instructions" element={<CareInstructions />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
            </Routes>
          </AppLayout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

