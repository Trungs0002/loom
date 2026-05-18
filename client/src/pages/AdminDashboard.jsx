/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Shared Admin Layout ──────────────────────────────────────────────────────
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isProducts = location.pathname === '/admin/products';
  const isOrders = location.pathname === '/admin/orders';
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex w-full">
      <aside className="w-64 bg-surface-container-low min-h-screen border-r border-outline-variant/30 px-lg py-xl flex flex-col sticky top-0 h-screen">
        <div className="mb-xxl">
          <Link to="/" className="font-headline-lg text-headline-lg tracking-widest text-primary">LOOM</Link>
          <div className="font-label-caps text-label-caps text-on-surface-variant mt-xs">Admin Panel</div>
        </div>
        <nav className="flex-1 flex flex-col gap-sm">
          <Link to="/admin/products" className={`flex items-center gap-md px-md py-sm rounded transition-colors ${isProducts ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span className="font-label-caps text-label-caps">Products</span>
          </Link>
          <Link to="/admin/orders" className={`flex items-center gap-md px-md py-sm rounded transition-colors ${isOrders ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            <span className="font-label-caps text-label-caps">Orders</span>
          </Link>
        </nav>
        <div className="mt-auto border-t border-outline-variant/30 pt-lg">
          <div className="font-body-md text-sm text-on-surface-variant mb-sm truncate">{user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-sm text-on-surface-variant hover:text-error transition-colors font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[18px]">logout</span> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-xl overflow-x-hidden">{children}</main>
    </div>
  );
};

// ─── Upload helper ────────────────────────────────────────────────────────────
const uploadImage = async (file, token) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return `${API_BASE}` + data.url;
};

// ─── Color Image Row ───────────────────────────────────────────────────────────
const ColorImageRow = ({ entry, onChange, onRemove, token }) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      onChange({ ...entry, image: url });
    } catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex items-center gap-md bg-surface-container rounded-lg px-md py-sm">
      <input
        value={entry.color}
        onChange={e => onChange({ ...entry, color: e.target.value })}
        placeholder="Color name"
        className="w-28 bg-transparent border-b border-outline-variant/50 py-xs font-body-md text-sm text-on-surface focus:border-primary outline-none"
      />
      <div className="flex items-center gap-sm flex-1">
        {entry.image && (
          <img src={entry.image} alt={entry.color} className="w-10 h-10 rounded object-cover border border-outline-variant/30" />
        )}
        <label className={`flex items-center gap-xs px-md py-xs rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[11px] ${uploading ? 'opacity-50' : ''}`}>
          <span className="material-symbols-outlined text-[16px]">upload</span>
          {uploading ? 'Uploading...' : entry.image ? 'Change' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {!entry.image && (
          <input
            value={entry.image}
            onChange={e => onChange({ ...entry, image: e.target.value })}
            placeholder="or paste URL"
            className="flex-1 bg-transparent border-b border-outline-variant/50 py-xs font-body-md text-sm text-on-surface focus:border-primary outline-none"
          />
        )}
      </div>
      <button onClick={onRemove} className="text-on-surface-variant hover:text-error transition-colors">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

// ─── Product Form Modal ────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSave, token }) => {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    description: product?.description || '',
    material: product?.material || '',
    dimensions: product?.dimensions || '',
    tags: product?.tags?.join(', ') || '',
  });
  const [colorImages, setColorImages] = useState(
    product?.colorImages?.length ? product.colorImages : [{ color: '', image: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const addColor = () => setColorImages(prev => [...prev, { color: '', image: '' }]);
  const updateColor = (i, val) => setColorImages(prev => prev.map((c, idx) => idx === i ? val : c));
  const removeColor = (i) => setColorImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const validColorImages = colorImages.filter(c => c.color && c.image);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      colorImages: validColorImages,
      colors: validColorImages.map(c => c.color),
      image: validColorImages[0]?.image || '',
    };
    try {
      const url = isEdit
        ? `${API_BASE}/api/products/${product._id}`
        : `${API_BASE}/api/products`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSave(data, isEdit);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const CATEGORIES = ['raw atlas', 'moonlight', 'blue orbit', 'sweetstatic'];

  const textFields = [
    { name: 'name', label: 'Product Name', required: true, full: true },
    { name: 'price', label: 'Price ($)', type: 'number', required: true },
    { name: 'stock', label: 'Stock Qty', type: 'number', required: true },
    { name: 'material', label: 'Material' },
    { name: 'dimensions', label: 'Dimensions' },
    { name: 'tags', label: 'Tags (comma-separated)', full: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-md">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center px-xl py-lg border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md text-primary">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-xl py-lg flex flex-col gap-lg">
          {error && <div className="bg-error/10 text-error p-sm rounded text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-lg">
            {textFields.map(f => (
              <div key={f.name} className={f.full ? 'col-span-2' : ''}>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type || 'text'}
                  value={form[f.name]}
                  onChange={handleChange}
                  required={f.required}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none"
                />
              </div>
            ))}
            {/* Category dropdown */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none capitalize"
              >
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none resize-none" />
            </div>
          </div>


          {/* Color Images Section */}
          <div>
            <div className="flex items-center justify-between mb-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Colors & Images</label>
              <button type="button" onClick={addColor} className="flex items-center gap-xs text-primary font-label-caps text-[11px] hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Color
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              {colorImages.map((entry, i) => (
                <ColorImageRow key={i} entry={entry} token={token}
                  onChange={val => updateColor(i, val)}
                  onRemove={() => removeColor(i)}
                />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-sm opacity-70">First color's image will be the main product image.</p>
          </div>

          <div className="flex gap-md justify-end pt-lg border-t border-outline-variant/20">
            <button type="button" onClick={onClose} className="px-lg py-sm border border-outline-variant/50 rounded font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded font-label-caps text-label-caps hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Admin Products Page ───────────────────────────────────────────────────────
export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      setProducts(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchProducts();
  }, [user, navigate, fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` },
    });
    if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
  };

  const handleSave = (saved, isEdit) => {
    if (isEdit) setProducts(prev => prev.map(p => p._id === saved._id ? saved : p));
    else setProducts(prev => [...prev, saved]);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Products</h1>
          <p className="text-sm text-on-surface-variant mt-xs">{products.length} total</p>
        </div>
        <button onClick={() => setModal('add')} className="flex items-center gap-sm bg-primary text-on-primary font-label-caps text-label-caps px-lg py-md rounded hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Product
        </button>
      </div>

      <div className="relative mb-lg w-full max-w-sm">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full bg-surface-container border border-outline-variant/50 rounded pl-xl pr-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps">
              <th className="px-lg py-md">Product</th>
              <th className="px-lg py-md">Colors</th>
              <th className="px-lg py-md">Price</th>
              <th className="px-lg py-md">Stock</th>
              <th className="px-lg py-md text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr><td colSpan="5" className="px-lg py-xl text-center text-on-surface-variant">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="px-lg py-xl text-center text-on-surface-variant">No products found.</td></tr>
            ) : filtered.map(product => (
              <tr key={product._id} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-surface-variant rounded overflow-hidden flex-shrink-0">
                      {product.image || product.colorImages?.[0]?.image
                        ? <img alt={product.name} className="w-full h-full object-cover" src={product.colorImages?.[0]?.image || product.image} />
                        : <span className="flex items-center justify-center w-full h-full material-symbols-outlined text-outline text-[20px]">image</span>}
                    </div>
                    <div>
                      <div className="font-medium text-on-surface text-sm">{product.name}</div>
                      <div className="text-xs text-on-surface-variant">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-lg py-md">
                  <div className="flex gap-xs flex-wrap">
                    {(product.colorImages?.length ? product.colorImages : []).map((ci, i) => (
                      <span key={i} className="inline-block px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-label-caps">{ci.color}</span>
                    ))}
                    {!product.colorImages?.length && product.colors?.map((c, i) => (
                      <span key={i} className="inline-block px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-label-caps">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-lg py-md font-medium text-primary">${product.price}</td>
                <td className="px-lg py-md">
                  <span className={`inline-flex px-2 py-1 rounded font-label-caps text-[10px] ${product.stock > 10 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : product.stock > 0 ? 'bg-surface-variant text-on-surface-variant' : 'bg-error-container text-on-error-container'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal(product)} className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="p-sm text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error-container">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          token={user?.token}
        />
      )}
    </AdminLayout>
  );
};

// ─── Admin Orders Page ─────────────────────────────────────────────────────────
const statusColors = {
  pending: 'bg-surface-variant text-on-surface-variant',
  processing: 'bg-primary-fixed text-on-primary-fixed',
  shipped: 'bg-tertiary-fixed text-on-tertiary-fixed',
  delivered: 'bg-secondary-fixed text-on-secondary-fixed',
  cancelled: 'bg-error-container text-on-error-container',
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user, navigate]);

  const updateStatus = async (orderId, status) => {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
  };

  const fmt = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <AdminLayout>
      <div className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-primary">Orders</h1>
        <p className="text-sm text-on-surface-variant mt-xs">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="text-center py-xxl text-on-surface-variant">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-xxl text-on-surface-variant">No orders yet.</div>
      ) : (
        <div className="flex flex-col gap-md">
          {orders.map(order => (
            <div key={order._id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-lg py-md cursor-pointer hover:bg-surface-container-low/50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="flex items-center gap-xl">
                  <div>
                    <div className="font-medium text-on-surface text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="text-xs text-on-surface-variant">{fmt(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-on-surface text-sm">{order.recipientName}</div>
                    <div className="text-xs text-on-surface-variant">{order.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-lg">
                  <div className="text-right">
                    <div className="font-medium text-primary">${order.totalAmount}</div>
                    <div className="text-xs text-on-surface-variant">{order.items?.length} item(s)</div>
                  </div>
                  <select value={order.status}
                    onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className={`font-label-caps text-[10px] px-2 py-1 rounded border-0 outline-none cursor-pointer ${statusColors[order.status] || ''}`}>
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform"
                    style={{ transform: expanded === order._id ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                </div>
              </div>

              {expanded === order._id && (
                <div className="border-t border-outline-variant/20 px-lg py-md">
                  <div className="grid grid-cols-2 gap-xl mb-lg">
                    <div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Shipping Address</div>
                      <div className="text-sm text-on-surface">{order.address}</div>
                      {order.note && <div className="text-xs text-on-surface-variant mt-xs italic">Note: {order.note}</div>}
                    </div>
                    <div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Payment</div>
                      <div className="text-sm text-on-surface">{order.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant mb-sm">Order Items</div>
                  <div className="flex flex-col gap-sm">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-md bg-surface-container rounded-lg px-md py-sm">
                        {item.product?.image && <img src={item.product.image} alt={item.product?.name} className="w-10 h-10 rounded object-cover" />}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-on-surface">{item.product?.name || 'Unknown'}</div>
                          <div className="text-xs text-on-surface-variant">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-medium text-primary text-sm">${item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-md pt-md border-t border-outline-variant/20">
                    <div className="font-headline-md text-headline-md text-primary">Total: ${order.totalAmount}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};



