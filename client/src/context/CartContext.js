import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    let items = saved ? JSON.parse(saved) : [];
    
    // Migration/Fix: Ensure all items have basePrice and customFee
    return items.map(item => {
      if (item.basePrice === undefined) {
        const fee = item.isCustomized ? 50000 : 0;
        return {
          ...item,
          basePrice: item.price - fee,
          customFee: fee
        };
      }
      return item;
    });
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity, customDetails = null) => {
    setCartItems(prev => {
      const isCustom = !!customDetails;
      const customName = customDetails?.name || '';
      const selectedIconLeft = customDetails?.selectedIconLeft || '';
      const selectedIconRight = customDetails?.selectedIconRight || '';
      const iconPosition = customDetails?.iconPosition || 'none';
      const fontFamily = customDetails?.fontFamily || 'Mrs Saint Delafield';
      const fontWeight = customDetails?.fontWeight || 'normal';
      const fontStyle = customDetails?.fontStyle || 'normal';
      
      const productColor = product.colors?.[0] || '';

      const exist = prev.find(x => 
        x.product === product._id && 
        x.color === productColor &&
        x.isCustomized === isCustom &&
        x.customName === customName &&
        x.selectedIconLeft === selectedIconLeft &&
        x.selectedIconRight === selectedIconRight &&
        x.iconPosition === iconPosition &&
        x.fontFamily === fontFamily &&
        x.fontWeight === fontWeight &&
        x.fontStyle === fontStyle
      );

      if (exist) {
        return prev.map(x => 
          (x.product === product._id && 
           x.color === productColor &&
           x.isCustomized === isCustom &&
           x.customName === customName &&
           x.selectedIconLeft === selectedIconLeft &&
           x.selectedIconRight === selectedIconRight &&
           x.iconPosition === iconPosition &&
           x.fontFamily === fontFamily &&
           x.fontWeight === fontWeight &&
           x.fontStyle === fontStyle) 
          ? { ...x, quantity: x.quantity + quantity } : x
        );
      }

      const basePrice = product.price;
      const customFee = isCustom ? 50000 : 0;
      const finalPrice = basePrice + customFee;

      return [...prev, { 
        product: product._id, 
        name: product.name,
        price: finalPrice, // total unit price (base + custom)
        basePrice: basePrice, // original unit price (this will be 459k for Dusk Clutch)
        customFee: customFee, // customization fee per unit (50k)
        originalPrice: product.originalPrice,
        onSale: product.onSale,
        image: product.image,
        color: productColor,
        isCustomized: isCustom,
        customName: customName,
        selectedIconLeft: selectedIconLeft,
        selectedIconRight: selectedIconRight,
        iconPosition: iconPosition,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        embroideryPos: customDetails?.embroideryPos || { x: 50, y: 50 },
        customPreviewFabric: customDetails?.customPreviewFabric || null,
        customPreviewPlacement: customDetails?.customPreviewPlacement || null,
        quantity 
      }];
    });
  };

  const removeFromCart = (uniqueId) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== uniqueId));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map((item, idx) => idx === index ? { ...item, quantity } : item));
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
