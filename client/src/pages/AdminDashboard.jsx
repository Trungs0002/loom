/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLayout, uploadImage, getImgUrl } from './AdminCategories';

// ─── Color Image Row ───────────────────────────────────────────────────────────
const ColorImageRow = ({ entry, onChange, onRemove, token }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { onChange({ ...entry, image: await uploadImage(file, token) }); }
    catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };
  return (
    <div className="flex items-center gap-md bg-surface-container rounded-lg px-md py-sm">
      <input value={entry.color} onChange={e => onChange({ ...entry, color: e.target.value })}
        placeholder="Color name"
        className="w-28 bg-transparent border-b border-outline-variant/50 py-xs text-sm text-on-surface focus:border-primary outline-none" />
      <div className="flex items-center gap-sm flex-1">
        {entry.image && <img src={getImgUrl(entry.image)} alt={entry.color} className="w-10 h-10 rounded object-cover border border-outline-variant/30" />}
        <label className={`flex items-center gap-xs px-md py-xs rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[11px] ${uploading ? 'opacity-50' : ''}`}>
          <span className="material-symbols-outlined text-[16px]">upload</span>
          {uploading ? 'Uploading...' : entry.image ? 'Change' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {!entry.image && (
          <input value={entry.image} onChange={e => onChange({ ...entry, image: e.target.value })}
            placeholder="or paste URL"
            className="flex-1 bg-transparent border-b border-outline-variant/50 py-xs text-sm text-on-surface focus:border-primary outline-none" />
        )}
      </div>
      <button type="button" onClick={onRemove} className="text-on-surface-variant hover:text-error transition-colors">
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
    innerLining: product?.innerLining || '',
    numberStraps: product?.numberStraps || '',
    detachableStrap: product?.detachableStrap || '',
    adjustableStrap: product?.adjustableStrap || '',
    closureType: product?.closureType || '',
    innerCompartments: product?.innerCompartments || '',
    dimensions: product?.dimensions || '',
    weight: product?.weight || '',
    careInstructions: product?.careInstructions || '',
    tags: product?.tags?.join(', ') || '',
    onSale: product?.onSale || false,
    originalPrice: product?.originalPrice || '',
  });
  const [colorImages, setColorImages] = useState(
    product?.colorImages?.length ? product.colorImages : [{ color: '', image: '' }]
  );
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };
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
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      onSale: form.onSale,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      colorImages: validColorImages,
      colors: validColorImages.map(c => c.color),
      image: validColorImages[0]?.image || '',
    };
    try {
      const url = isEdit ? `${API_BASE}/api/products/${product._id}` : `${API_BASE}/api/products`;
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

  const textFields = [
    { name: 'name', label: 'Product Name', required: true, full: true, placeholder: 'e.g. Dusk Clutch' },
    { name: 'price', label: 'Current Price', type: 'number', required: true, placeholder: 'e.g. 259000' },
    { name: 'stock', label: 'Stock Qty', type: 'number', required: true, placeholder: 'e.g. 15' },
    { name: 'material', label: 'Material', placeholder: 'e.g. Recycled jean/denim' },
    { name: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 26 x 5 x 13 cm' },
    { name: 'tags', label: 'Tags (comma-separated)', full: true, placeholder: 'e.g. Clutch, Denim, Recycled' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-md">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center px-xl py-lg border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md text-primary">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-xl py-lg flex flex-col gap-lg">
          {error && <div className="bg-error/10 text-error p-sm rounded text-sm">{error}</div>}
          
          <div className="bg-primary/5 border border-primary/10 p-md rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-sm text-primary">
              <span className="material-symbols-outlined">sell</span>
              <span className="font-label-caps text-label-caps">Enable Sale / Discount</span>
            </div>
            <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 gap-lg">
            {textFields.map(f => (
              <div key={f.name} className={f.full ? 'col-span-2' : ''}>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">{f.label}</label>
                <input name={f.name} type={f.type || 'text'} value={form[f.name]} onChange={handleChange} required={f.required} placeholder={f.placeholder}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none placeholder:text-on-surface-variant/50" />
              </div>
            ))}
            
            {form.onSale && (
              <div className="col-span-2 bg-surface-container-low border border-outline-variant/30 p-md rounded-xl">
                <label className="block font-label-caps text-label-caps text-error mb-xs">Original Price (Strikethrough)</label>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} required placeholder="e.g. 299000"
                  className="w-full bg-surface-container border border-error/30 rounded px-md py-sm text-sm text-on-surface focus:border-error outline-none" />
                <p className="text-[10px] text-on-surface-variant mt-xs italic">This price will be shown with a line through it.</p>
              </div>
            )}

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none capitalize">
                <option value="">— Select category —</option>
                {categories.map(c => (
                  <option key={c._id} value={c.name} className="capitalize">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..."
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none resize-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Colors & Images</label>
              <button type="button" onClick={addColor} className="flex items-center gap-xs text-primary font-label-caps text-[11px] hover:opacity-70">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Color
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              {colorImages.map((entry, i) => (
                <ColorImageRow key={i} entry={entry} token={token}
                  onChange={val => updateColor(i, val)} onRemove={() => removeColor(i)} />
              ))}
            </div>
          </div>

          <div className="flex gap-md justify-end pt-lg border-t border-outline-variant/20">
            <button type="button" onClick={onClose} className="px-lg py-sm border border-outline-variant/50 rounded font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-variant">Cancel</button>
            <button type="submit" disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded font-label-caps text-label-caps hover:opacity-90 disabled:opacity-60">
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
        <button onClick={() => setModal('add')}
          className="flex items-center gap-sm bg-primary text-on-primary font-label-caps text-label-caps px-lg py-md rounded hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Product
        </button>
      </div>

      <div className="relative mb-lg w-full max-w-sm">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full bg-surface-container border border-outline-variant/50 rounded pl-xl pr-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps">
              <th className="px-lg py-md">Product</th>
              <th className="px-lg py-md">Price</th>
              <th className="px-lg py-md text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr><td colSpan="3" className="px-lg py-xl text-center text-on-surface-variant">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="3" className="px-lg py-xl text-center text-on-surface-variant">No products found.</td></tr>
            ) : filtered.map(product => (
              <tr key={product._id} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-surface-variant rounded overflow-hidden flex-shrink-0 relative">
                      {product.onSale && <span className="absolute top-0 left-0 bg-error text-white text-[8px] px-1 font-bold">SALE</span>}
                      {product.colorImages?.[0]?.image || product.image
                        ? <img alt={product.name} className="w-full h-full object-cover" src={getImgUrl(product.colorImages?.[0]?.image || product.image)} />
                        : <span className="flex items-center justify-center w-full h-full material-symbols-outlined text-outline text-[20px]">image</span>}
                    </div>
                    <div>
                      <div className="font-medium text-on-surface text-sm">{product.name}</div>
                      <div className="text-xs text-on-surface-variant capitalize">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-lg py-md">
                  <div className="flex flex-col">
                    <span className="font-medium text-primary text-sm">{formatPrice(product.price)}</span>
                    {product.onSale && <span className="text-[10px] text-on-surface-variant line-through">{formatPrice(product.originalPrice)}</span>}
                  </div>
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
        <ProductModal product={modal === 'add' ? null : modal} onClose={() => setModal(null)}
          onSave={handleSave} token={user?.token} />
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
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
      const d = await res.json();
      setOrders(Array.isArray(d) ? d : []);
    } catch (err) { console.error(err); }
  }, [user]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/stats`, { headers: { Authorization: `Bearer ${user.token}` } });
      const d = await res.json();
      setStats(Array.isArray(d) ? d : []);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    Promise.all([fetchOrders(), fetchStats()]).finally(() => setLoading(false));
  }, [user, navigate, fetchOrders, fetchStats]);

  const updateStatus = async (orderId, status) => {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fmt = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <AdminLayout>
      <div className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-primary">Orders</h1>
        <p className="text-sm text-on-surface-variant mt-xs">Manage and track customer purchases</p>
      </div>

      {!loading && stats.length > 0 && (
        <section className="mb-xxl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm">
              <p className="text-[10px] font-label-caps text-on-surface-variant mb-1">Total Revenue</p>
              <h3 className="text-xl font-bold text-primary">{formatPrice(stats.reduce((acc, curr) => acc + curr.totalSales, 0))}</h3>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm">
              <p className="text-[10px] font-label-caps text-on-surface-variant mb-1">Orders this month</p>
              <h3 className="text-xl font-bold text-on-surface">{stats[0]?.orderCount || 0} Orders</h3>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm">
              <p className="text-[10px] font-label-caps text-on-surface-variant mb-1">Avg. Order Value</p>
              <h3 className="text-xl font-bold text-on-surface">
                {formatPrice(stats.reduce((acc, curr) => acc + curr.totalSales, 0) / stats.reduce((acc, curr) => acc + curr.orderCount, 0) || 0)}
              </h3>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search ID, Name, Phone..."
              className="w-full bg-surface-container border border-outline-variant/50 rounded px-xl py-sm text-sm text-on-surface focus:border-primary outline-none" />
          </div>
          
          <div className="flex gap-xs overflow-x-auto no-scrollbar pb-xs md:pb-0">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded text-[10px] font-label-caps uppercase transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="text-center py-xl text-on-surface-variant">Loading...</div>
          : filteredOrders.length === 0 ? <div className="text-center py-xl bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-on-surface-variant">No orders found.</div>
          : (
            <div className="flex flex-col gap-sm">
              {filteredOrders.map(order => (
                <div key={order._id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between px-lg py-md cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                    <div className="flex items-center gap-xl">
                      <div>
                        <div className="font-bold text-on-surface text-sm uppercase">#{order._id.slice(-8)}</div>
                        <div className="text-[11px] text-on-surface-variant">{fmt(order.createdAt)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-on-surface text-sm">{order.recipientName}</div>
                        <div className="text-[11px] text-on-surface-variant">{order.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-lg">
                      <div className="text-right hidden sm:block">
                        <div className="font-bold text-primary text-sm">{formatPrice(order.totalAmount)}</div>
                        <div className="text-[10px] text-on-surface-variant">{order.items?.length} item(s)</div>
                      </div>
                      <select value={order.status}
                        onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className={`font-label-caps text-[10px] px-3 py-1 rounded border border-outline-variant/30 outline-none cursor-pointer ${statusColors[order.status] || ''}`}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform"
                        style={{ transform: expanded === order._id ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                    </div>
                  </div>
                  {expanded === order._id && (
                    <div className="border-t border-outline-variant/20 px-lg py-md bg-surface-container-low/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                        <div>
                          <div className="font-label-caps text-[10px] text-on-surface-variant mb-xs">Shipping Information</div>
                          <div className="text-sm text-on-surface font-medium">{order.recipientName}</div>
                          <div className="text-xs text-on-surface-variant mt-xs leading-relaxed">{order.address}</div>
                          {order.note && <div className="mt-sm text-xs italic text-secondary-container">Note: {order.note}</div>}
                        </div>
                        <div>
                          <div className="font-label-caps text-[10px] text-on-surface-variant mb-xs">Payment & Details</div>
                          <div className="text-sm text-on-surface">{order.paymentMethod}</div>
                          <div className="text-xs text-on-surface-variant mt-xs">ID: {order._id}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-xs">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-md bg-surface-container/50 rounded-lg px-md py-sm">
                            {item.product?.image && <img src={getImgUrl(item.product.image)} alt={item.product?.name} className="w-10 h-10 rounded object-cover" />}
                            <div className="flex-1 overflow-hidden">
                              <div className="text-sm font-medium text-on-surface truncate">{item.product?.name || 'Unknown'}</div>
                              <div className="text-[10px] text-on-surface-variant">Qty: {item.quantity}</div>
                            </div>
                            <div className="font-bold text-primary text-sm">{formatPrice(item.price * item.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </section>
    </AdminLayout>
  );
};

// ─── Admin Users Page ──────────────────────────────────────────────────────────
export const AdminUsers = () => {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setAdmins(data);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchAdmins();
  }, [user, navigate, fetchAdmins]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/auth/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name, pass }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Admin account created successfully!' });
        setName('');
        setPass('');
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === user._id) return alert('You cannot delete yourself!');
    if (!window.confirm('Are you sure you want to delete this admin account?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) fetchAdmins();
      else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <AdminLayout>
      <div className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-primary">Admin Management</h1>
        <p className="text-sm text-on-surface-variant mt-xs">Create and manage administrator accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl lg:gap-xxl">
        {/* Create Form */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl shadow-sm h-fit">
          <h2 className="font-title-lg text-title-lg mb-lg flex items-center gap-sm">
            <span className="material-symbols-outlined">person_add</span>
            Add New Admin
          </h2>
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Username</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Admin username"
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Admin password"
                className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
            </div>

            {message.text && (
              <div className={`p-sm rounded text-sm ${message.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-on-primary py-md rounded font-label-caps text-label-caps hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? 'Creating...' : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  Create Admin Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admins List */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
          <div className="px-lg py-md border-b border-outline-variant/30 bg-surface-container-low">
            <h2 className="font-label-caps text-label-caps text-on-surface-variant">Current Administrators</h2>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {fetching ? (
              <div className="p-xl text-center text-on-surface-variant text-sm">Loading admins...</div>
            ) : admins.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant text-sm">No admins found.</div>
            ) : admins.map(admin => (
              <div key={admin._id} className="px-lg py-md flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">account_circle</span>
                  </div>
                  <div>
                    <div className="font-medium text-on-surface text-sm">{admin.name} {admin._id === user._id && <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded ml-1 font-bold uppercase">You</span>}</div>
                    <div className="text-xs text-on-surface-variant">ID: {admin._id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>
                {admin._id !== user._id && (
                  <button onClick={() => handleDelete(admin._id)} className="p-sm text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error-container">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ─── Admin Analytics Dashboard ────────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetch(`${API_BASE}/api/orders/dashboard-stats`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <AdminLayout><div className="text-center py-xxl text-on-surface-variant">Loading analytics...</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="text-center py-xxl text-error font-bold">Failed to load analytics data.</div></AdminLayout>;

  // Chart Logic (Simple SVG Bar Chart)
  const maxSale = Math.max(...data.monthlySales.map(m => m.amount), 1);
  const getMonthLabel = (m) => new Date(0, m-1).toLocaleString('en-US', { month: 'short' });

  return (
    <AdminLayout>
      <div className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg text-primary">Dashboard Overview</h1>
        <p className="text-sm text-on-surface-variant mt-xs">Real-time performance metrics and sales trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        {[
          { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: 'payments' },
          { label: 'Total Orders', value: data.ordersCount, icon: 'shopping_bag' },
          { label: 'Total Products', value: data.productsCount, icon: 'inventory_2' },
          { label: 'Total Users', value: data.usersCount, icon: 'group' }
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-xs">
              <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">{kpi.icon}</span>
              </div>
              <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest">Live Stats</span>
            </div>
            <div>
              <p className="font-label-caps text-[10px] text-on-surface-variant mb-xs uppercase tracking-tight">{kpi.label}</p>
              <h3 className="text-xl font-bold text-on-surface tracking-tighter">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-xl">
            <h2 className="font-title-lg text-title-lg text-primary flex items-center gap-sm">
              <span className="material-symbols-outlined">trending_up</span>
              Sales Trend (6 Months)
            </h2>
          </div>
          
          <div className="flex-grow flex items-end gap-md md:gap-xl px-md border-b border-l border-outline-variant/30 pb-2 h-64 min-h-[250px]">
            {data.monthlySales.map((m, i) => {
              const height = (m.amount / maxSale) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    {formatPrice(m.amount)}
                  </div>
                  <div 
                    className="w-full bg-primary/10 group-hover:bg-primary/90 rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                  </div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                    {getMonthLabel(m._id.month)} '{String(m._id.year).slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center text-[10px] text-on-surface-variant/40 uppercase tracking-widest">Monthly Gross Revenue Comparison</div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl shadow-sm h-fit">
          <div className="flex items-center justify-between mb-xl">
            <h2 className="font-title-lg text-title-lg text-primary flex items-center gap-sm">
              <span className="material-symbols-outlined">workspace_premium</span>
              Top Sellers
            </h2>
          </div>
          <div className="flex flex-col gap-lg">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-md group">
                <div className="w-16 h-16 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm">
                  <img src={getImgUrl(p.productDetails.colorImages?.[0]?.image || p.productDetails.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-0 left-0 bg-primary text-on-primary text-[8px] px-1 font-bold rounded-br-lg">#{i+1}</div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-on-surface truncate uppercase tracking-tighter">{p.productDetails.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">{p.productDetails.category}</p>
                  <div className="flex items-center gap-sm mt-xs">
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(p.count / data.topProducts[0].count) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-primary uppercase">{p.count} Sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
