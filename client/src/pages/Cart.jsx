import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../config';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const total = getCartTotal();

  return (
    <main className="w-full max-w-container-max mx-auto px-gutter py-xxl flex flex-col gap-xxl min-h-screen">
      {/* Page Header */}
      <header className="flex flex-col gap-sm">
        <h1 className="font-display-lg text-display-lg hidden md:block text-primary">Your Cart</h1>
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:hidden text-primary">Your Cart</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{cartItems.length} items securely reserved for checkout.</p>
      </header>

      {/* Cart Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl">
        {/* Cart Items List */}
        <section className="lg:col-span-8 flex flex-col gap-xl">
          {/* List Header (Desktop only) */}
          <div className="hidden md:grid grid-cols-12 gap-md pb-md border-b border-outline-variant/30 font-label-caps text-label-caps text-on-surface-variant">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-xl text-center">
              <p className="text-on-surface-variant font-body-md text-body-md mb-md">Your cart is empty.</p>
              <Link to="/products" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded hover:bg-primary-container transition-colors">Continue Shopping</Link>
            </div>
          ) : (
            cartItems.map(item => (
              <article key={item.product} className="flex flex-col md:grid md:grid-cols-12 gap-md items-start md:items-center py-lg border-b border-outline-variant/30 relative">
                <div className="col-span-6 flex gap-lg w-full">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-surface-container-low overflow-hidden rounded">
                    <img 
                      alt={item.name} 
                      className="w-full h-full object-cover mix-blend-multiply" 
                      src={item.image} 
                    />
                  </div>
                  <div className="flex flex-col gap-xs justify-center">
                    <h3 className="font-headline-md text-headline-md text-primary">{item.name}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{item.color}</p>
                    <p className="font-body-md text-body-md text-primary mt-sm md:hidden">{formatPrice(item.price)}</p>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-start md:justify-center w-full mt-md md:mt-0">
                  <div className="flex items-center border border-outline-variant/50 rounded">
                    <button onClick={() => updateQuantity(item.product, item.quantity - 1)} aria-label="Decrease quantity" className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                    </button>
                    <span className="font-body-md text-body-md text-primary w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product, item.quantity + 1)} aria-label="Increase quantity" className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    </button>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-between md:justify-end w-full mt-md md:mt-0">
                  <p className="font-body-md text-body-md text-primary hidden md:block">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.product)} aria-label="Remove item" className="text-on-surface-variant hover:text-error transition-colors md:ml-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    <span className="font-label-caps text-label-caps md:hidden">Remove</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-4 mt-xl lg:mt-0">
          <div className="bg-surface-container-low p-lg flex flex-col gap-lg rounded">
            <h2 className="font-headline-md text-headline-md text-primary border-b border-outline-variant/30 pb-md">Order Summary</h2>
            <div className="flex flex-col gap-md">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Estimated Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center font-headline-md text-headline-md text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to={cartItems.length > 0 ? "/checkout" : "#"} className={`w-full font-label-caps text-label-caps py-md mt-sm transition-colors duration-300 flex justify-center items-center gap-sm group ${cartItems.length > 0 ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}>
              Proceed to Checkout
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
            <div className="flex items-center gap-sm justify-center mt-sm text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
              <span className="font-body-md text-body-md text-sm">Secure Checkout</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Cart;

