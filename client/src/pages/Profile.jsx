import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE, { formatPrice } from '../config';
import { generateInvoiceHTML } from '../components/InvoiceTemplate';

const Profile = () => {
  const { user, logout, headerLogo } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePrint = (order) => {
    const invoiceHTML = generateInvoiceHTML(order, headerLogo);
    const printWindow = window.open('', '_blank', 'width=900,height=950,scrollbars=yes');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#081F5C]">My Account</h1>
          <p className="text-on-surface-variant mt-2">Manage your personal information and view order history</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Info & Password */}
          <aside className="lg:w-1/3 space-y-8">
            {/* User Profile Card */}
            <section className="bg-white dark:bg-surface-container-low rounded-3xl p-8 shadow-sm border border-outline-variant/30">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-6xl">account_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface">{user.name}</h2>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase mt-2">
                  {user.role}
                </span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-outline-variant/30">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-error/5 text-error hover:bg-error/10 rounded-2xl transition-all font-semibold"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            </section>

            {/* Change Password Card */}
            <section className="bg-white dark:bg-surface-container-low rounded-3xl p-8 shadow-sm border border-outline-variant/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                {message.text && (
                  <div className={`p-3 rounded-xl text-sm ${message.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#081F5C] text-white py-3 rounded-2xl hover:bg-[#0a2775] transition-all font-bold shadow-md shadow-primary/10"
                >
                  Update Password
                </button>
              </form>
            </section>
          </aside>

          {/* Main Content: Order History */}
          <main className="lg:w-2/3">
            <div className="bg-white dark:bg-surface-container-low rounded-3xl p-8 shadow-sm border border-outline-variant/30 min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">local_shipping</span>
                  Order History
                </h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {orders.length} orders
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-on-surface-variant animate-pulse">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-surface-container mx-auto rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-4xl">shopping_cart_off</span>
                  </div>
                  <p className="text-on-surface-variant mb-6 text-lg">You don't have any orders yet.</p>
                  <button 
                    onClick={() => navigate('/products')}
                    className="bg-[#081F5C] text-white px-8 py-3 rounded-2xl hover:opacity-90 transition-all font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="group border border-outline-variant/30 rounded-2xl p-6 hover:bg-surface-container transition-all hover:shadow-md">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="font-bold text-primary flex items-center gap-2">
                            Order ID: <span className="text-on-surface select-all">#{order._id.slice(-8).toUpperCase()}</span>
                          </p>
                          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            {new Date(order.createdAt).toLocaleString('en-US')}
                          </p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </div>
                      </div>

                      {/* Order Tracking Progress Bar */}
                      {order.status !== 'cancelled' ? (
                        <div className="mb-8 px-2">
                          <div className="relative flex justify-between items-center w-full">
                            {/* Line connecting the dots */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container -translate-y-1/2 z-0"></div>
                            <div 
                              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                              style={{ 
                                width: order.status === 'pending' ? '0%' : 
                                       order.status === 'processing' ? '33.33%' : 
                                       order.status === 'shipped' ? '66.66%' : '100%' 
                              }}
                            ></div>

                            {[
                              { id: 'pending', label: 'Pending', icon: 'pending_actions' },
                              { id: 'processing', label: 'Processing', icon: 'sync' },
                              { id: 'shipped', label: 'Shipped', icon: 'local_shipping' },
                              { id: 'delivered', label: 'Delivered', icon: 'check_circle' }
                            ].map((step, index, array) => {
                              const steps = ['pending', 'processing', 'shipped', 'delivered'];
                              const currentIndex = steps.indexOf(order.status);
                              const isCompleted = index <= currentIndex;
                              const isActive = index === currentIndex;

                              return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isActive ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-110' : 
                                    isCompleted ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                                  }`}>
                                    <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold mt-2 absolute -bottom-6 whitespace-nowrap ${
                                    isActive ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="h-6"></div> {/* Spacer for absolute labels */}
                        </div>
                      ) : (
                        <div className="mb-6 bg-error/5 border border-error/20 rounded-xl p-4 flex items-center gap-3 text-error">
                          <span className="material-symbols-outlined">cancel</span>
                          <span className="text-sm font-semibold">This order has been cancelled.</span>
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-6 bg-surface-container-low/50 rounded-xl p-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-primary/5 rounded flex items-center justify-center text-[10px] font-bold text-primary">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-on-surface">{item.product?.name || 'Product no longer exists'}</span>
                            </div>
                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-dashed border-outline-variant">
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-medium">Total Amount:</span>
                          <span className="text-xl font-bold text-[#081F5C]">{formatPrice(order.totalAmount)}</span>
                        </div>
                        <button 
                          onClick={() => handlePrint(order)}
                          className="flex items-center gap-2 py-2 px-4 border border-primary text-primary hover:bg-primary/5 rounded-xl transition-all font-bold text-sm"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          Print Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
