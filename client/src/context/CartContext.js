import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const exist = prev.find(x => x.product === product._id);
      if (exist) {
        return prev.map(x => x.product === product._id ? { ...x, quantity: x.quantity + quantity } : x);
      }
      return [...prev, { 
        product: product._id, 
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.colors?.[0] || '',
        quantity 
      }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(x => x.product !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(x => x.product === id ? { ...x, quantity } : x));
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
