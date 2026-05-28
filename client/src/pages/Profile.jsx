import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE, { formatPrice } from '../config';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
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
        setMessage({ type: 'success', text: 'Cập nhật mật khẩu thành công' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Đã xảy ra lỗi' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#081F5C]">Tài khoản của tôi</h1>
          <p className="text-on-surface-variant mt-2">Quản lý thông tin cá nhân và xem lại lịch sử mua hàng</p>
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
                  Đăng xuất tài khoản
                </button>
              </div>
            </section>

            {/* Change Password Card */}
            <section className="bg-white dark:bg-surface-container-low rounded-3xl p-8 shadow-sm border border-outline-variant/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                Đổi mật khẩu
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Xác nhận mật khẩu</label>
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
                  Cập nhật mật khẩu
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
                  Lịch sử đơn hàng
                </h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {orders.length} đơn hàng
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-on-surface-variant animate-pulse">Đang tải đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-surface-container mx-auto rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-4xl">shopping_cart_off</span>
                  </div>
                  <p className="text-on-surface-variant mb-6 text-lg">Bạn chưa có đơn hàng nào.</p>
                  <button 
                    onClick={() => navigate('/products')}
                    className="bg-[#081F5C] text-white px-8 py-3 rounded-2xl hover:opacity-90 transition-all font-bold"
                  >
                    Bắt đầu mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="group border border-outline-variant/30 rounded-2xl p-6 hover:bg-surface-container transition-all hover:shadow-md">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="font-bold text-primary flex items-center gap-2">
                            Mã đơn: <span className="text-on-surface select-all">#{order._id.slice(-8).toUpperCase()}</span>
                          </p>
                          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
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
                      
                      <div className="space-y-3 mb-6 bg-surface-container-low/50 rounded-xl p-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-primary/5 rounded flex items-center justify-center text-[10px] font-bold text-primary">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-on-surface">{item.product?.name || 'Sản phẩm không còn tồn tại'}</span>
                            </div>
                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-dashed border-outline-variant">
                        <span className="text-on-surface-variant font-medium">Tổng số tiền:</span>
                        <span className="text-xl font-bold text-[#081F5C]">{formatPrice(order.totalAmount)}</span>
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
