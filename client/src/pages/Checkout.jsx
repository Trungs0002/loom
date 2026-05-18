import API_BASE from '../config';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const total = getCartTotal();

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    address: '',
    note: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to place an order");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      const items = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        ...formData,
        items,
        totalAmount: total,
        paymentMethod: 'Cash on Delivery'
      };

      const res = await fetch('${API_BASE}/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        clearCart();
        alert('Order placed successfully!');
        navigate('/');
      } else {
        const errorData = await res.json();
        alert(`Error placing order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert('Network error while placing order');
    }
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xxl grid grid-cols-1 lg:grid-cols-12 gap-xxl">
      {/* Left Column: Checkout Form */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Checkout</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Please provide your details below to complete your order.</p>
        </div>

        {/* Shipping Information */}
        <section className="flex flex-col gap-lg">
          <h2 className="font-headline-md text-headline-md text-primary pb-sm border-b border-outline-variant/30">Shipping Information</h2>
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-lg mt-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="recipientName">Full Name</label>
                <input 
                  required
                  value={formData.recipientName}
                  onChange={handleChange}
                  className="bg-transparent border-0 border-b border-outline-variant/50 py-sm font-body-md text-body-md text-primary transition-colors focus:ring-0 px-0 outline-none focus:border-b-secondary" 
                  id="recipientName" 
                  placeholder="Jane Doe" 
                  type="text" 
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="phone">Phone Number</label>
                <input 
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-transparent border-0 border-b border-outline-variant/50 py-sm font-body-md text-body-md text-primary transition-colors focus:ring-0 px-0 outline-none focus:border-b-secondary" 
                  id="phone" 
                  placeholder="+1 (555) 000-0000" 
                  type="tel" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="address">Shipping Address</label>
              <input 
                required
                value={formData.address}
                onChange={handleChange}
                className="bg-transparent border-0 border-b border-outline-variant/50 py-sm font-body-md text-body-md text-primary transition-colors focus:ring-0 px-0 outline-none focus:border-b-secondary" 
                id="address" 
                placeholder="123 Minimalist Way, Apt 4B, NY 10001" 
                type="text" 
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="note">Note (Optional)</label>
              <textarea 
                value={formData.note}
                onChange={handleChange}
                className="bg-transparent border-0 border-b border-outline-variant/50 py-sm font-body-md text-body-md text-primary transition-colors focus:ring-0 px-0 resize-none outline-none focus:border-b-secondary" 
                id="note" 
                placeholder="Special instructions for delivery..." 
                rows="2"
              ></textarea>
            </div>
          </form>
        </section>

        {/* Payment Method */}
        <section className="flex flex-col gap-lg mt-md">
          <h2 className="font-headline-md text-headline-md text-primary pb-sm border-b border-outline-variant/30">Payment Method</h2>
          <div className="mt-sm">
            <div className="flex items-center gap-md p-md border border-outline-variant/30 bg-surface-container-low rounded-DEFAULT cursor-not-allowed opacity-90">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>local_shipping</span>
              <div className="flex-grow">
                <h3 className="font-body-md text-body-md font-medium text-primary">Cash on Delivery</h3>
                <p className="font-label-caps text-label-caps text-on-surface-variant lowercase mt-xs">Pay when you receive your order.</p>
              </div>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="bg-surface-container-low p-lg rounded-DEFAULT flex flex-col gap-lg sticky top-[100px]">
          <h2 className="font-headline-md text-headline-md text-primary pb-sm border-b border-outline-variant/30">Order Summary</h2>
          {/* Items list */}
          <div className="flex flex-col gap-md">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-md items-center">
                <div className="w-16 h-20 bg-surface-container flex-shrink-0 relative overflow-hidden rounded-sm">
                  <img 
                    alt={item.name} 
                    className="object-cover w-full h-full absolute inset-0" 
                    src={item.image} 
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="font-body-md text-body-md text-primary">{item.name}</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-xs">Qty: {item.quantity}</span>
                </div>
                <span className="font-body-md text-body-md text-primary">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-sm pt-md border-t border-outline-variant/30">
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Subtotal</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="flex justify-between font-headline-md text-headline-md text-primary pt-md border-t border-outline-variant/30">
            <span>Total</span>
            <span>${total}</span>
          </div>
          <button 
            type="submit"
            form="checkout-form"
            disabled={cartItems.length === 0}
            className={`w-full font-label-caps text-label-caps uppercase py-md px-lg hover:opacity-90 transition-opacity mt-sm tracking-widest ${cartItems.length > 0 ? 'bg-primary text-on-primary' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}
          >
            Place Order
          </button>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

