/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateInvoiceHTML } from '../components/InvoiceTemplate';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, headerLogo } = useAuth();
  const navigate = useNavigate();
  const total = getCartTotal();
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Calculate original total to show savings
  const originalTotal = cartItems.reduce((acc, item) => {
    return acc + (item.onSale ? (item.originalPrice || item.price) : item.price) * item.quantity;
  }, 0);
  const savings = originalTotal - total;

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    address: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePrint = (order) => {
    const invoiceHTML = generateInvoiceHTML(order, user);
    const printWindow = window.open('', '_blank', 'width=1200,height=1500,scrollbars=yes');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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

    setProcessing(true);
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
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'VNPay Online'
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        if (paymentMethod === 'VNPAY') {
          // Create VNPay payment URL
          const vnpayRes = await fetch(`${API_BASE}/api/payment/create-vnpay-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
              orderId: data._id,
              amount: total
            })
          });

          if (vnpayRes.ok) {
            const { paymentUrl } = await vnpayRes.json();
            window.location.href = paymentUrl; // Redirect to VNPay
            return;
          } else {
            alert('Failed to initialize VNPay payment. Your order was created as COD.');
          }
        }

        const orderForInvoice = {
          ...data,
          items: data.items.map((item, idx) => ({
            ...item,
            product: { name: cartItems[idx].name }
          }))
        };
        
        clearCart();
        setOrderSuccess(orderForInvoice);
      } else {
        const errorData = await res.json();
        alert(`Error placing order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert('Network error while placing order');
    } finally {
      setProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <main className="flex-grow w-full max-w-2xl mx-auto px-gutter py-xxl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Order Successful!</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Thank you for your purchase. Your order ID is <span className="font-bold text-primary">#{orderSuccess._id.toUpperCase()}</span>.
        </p>
        
        <div className="w-full flex flex-col gap-sm">
          <button 
            onClick={() => handlePrint(orderSuccess)}
            className="w-full bg-primary text-on-primary font-label-caps py-md px-lg rounded-DEFAULT hover:bg-primary-container transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">print</span>
            Print Invoice
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full border border-outline text-primary font-label-caps py-md px-lg rounded-DEFAULT hover:bg-surface-container transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-sm">
            {/* COD Option */}
            <div 
              onClick={() => setPaymentMethod('COD')}
              className={`flex items-center gap-md p-md border rounded-DEFAULT cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: `'FILL' ${paymentMethod === 'COD' ? 1 : 0}` }}>local_shipping</span>
              <div className="flex-grow">
                <h3 className="font-body-md text-body-md font-medium text-primary">Cash on Delivery (COD)</h3>
                <p className="font-label-caps text-[10px] text-on-surface-variant lowercase mt-xs">Pay when you receive.</p>
              </div>
              {paymentMethod === 'COD' && <span className="material-symbols-outlined text-primary">check_circle</span>}
            </div>

            {/* VNPay Option */}
            <div 
              onClick={() => setPaymentMethod('VNPAY')}
              className={`flex items-center gap-md p-md border rounded-DEFAULT cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: `'FILL' ${paymentMethod === 'VNPAY' ? 1 : 0}` }}>account_balance_wallet</span>
              <div className="flex-grow">
                <h3 className="font-body-md text-body-md font-medium text-primary">VNPay / E-Wallet</h3>
                <p className="font-label-caps text-[10px] text-on-surface-variant lowercase mt-xs">Secure online payment.</p>
              </div>
              {paymentMethod === 'VNPAY' && <span className="material-symbols-outlined text-primary">check_circle</span>}
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
                <div className="w-16 h-20 bg-surface-container flex-shrink-0 relative overflow-hidden rounded-sm border border-outline-variant/20">
                  <img 
                    alt={item.name} 
                    className="object-cover w-full h-full" 
                    src={item.image} 
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="font-body-md text-body-md text-primary">{item.name}</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-xs text-[10px]">Qty: {item.quantity}</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="font-body-md text-body-md text-primary">{formatPrice(item.price * item.quantity)}</span>
                  {item.onSale && (
                    <span className="text-[10px] line-through opacity-50">{formatPrice((item.originalPrice || item.price) * item.quantity)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-sm pt-md border-t border-outline-variant/30">
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Items Subtotal</span>
              {savings > 0 ? (
                <div className="flex flex-col items-end">
                  <span className="text-on-surface">{formatPrice(total)}</span>
                  <span className="text-[10px] line-through opacity-50">{formatPrice(originalTotal)}</span>
                </div>
              ) : (
                <span>{formatPrice(total)}</span>
              )}
            </div>
            {savings > 0 && (
              <div className="flex justify-between font-body-md text-body-md text-error">
                <span>Total Savings</span>
                <span>-{formatPrice(savings)}</span>
              </div>
            )}
            <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Shipping</span>
              <span className="text-primary">FREE</span>
            </div>
          </div>
          <div className="flex justify-between font-headline-md text-headline-md text-primary pt-md border-t border-outline-variant/30">
            <span>Order Total</span>
            <span className="text-xl font-bold">{formatPrice(total)}</span>
          </div>
          <button 
            type="submit"
            form="checkout-form"
            disabled={cartItems.length === 0}
            className={`w-full font-label-caps text-label-caps py-md px-lg transition-all duration-300 mt-sm ${cartItems.length > 0 ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-outline-variant text-on-surface-variant cursor-not-allowed'}`}
          >
            Place Order
          </button>
        </div>
      </div>
    </main>
  );
};

export default Checkout;



