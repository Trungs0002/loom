/* eslint-disable */
import API_BASE, { formatPrice } from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLayout, uploadImage, getImgUrl } from './AdminCategories';

// ─── Shared Color Image Row ──────────────────────────────────────────────────
const ColorImageRow = ({ entry, onChange, onRemove, token }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { 
      const url = await uploadImage(file, token);
      onChange({ ...entry, image: url }); 
    }
    catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };
  return (
    <div className="flex items-center gap-4 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
      <input value={entry.color} onChange={e => onChange({ ...entry, color: e.target.value })}
        placeholder="Color name"
        className="w-32 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 outline-none focus:border-primary" />
      <div className="flex items-center gap-3 flex-1">
        {entry.image && <img src={getImgUrl(entry.image)} alt={entry.color} className="w-8 h-8 rounded border border-slate-200 object-cover" />}
        <label className={`flex items-center gap-2 px-3 py-1.5 rounded border border-slate-200 cursor-pointer hover:bg-white transition-colors text-[10px] font-bold text-slate-600 ${uploading ? 'opacity-50' : ''}`}>
          <span className="material-symbols-outlined text-[16px]">upload</span>
          {uploading ? 'Syncing...' : 'Upload Asset'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
};

// ─── Product Modal ───────────────────────────────────────────────────────────
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
  const [colorImages, setColorImages] = useState(product?.colorImages?.length ? product.colorImages : [{ color: '', image: '' }]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`).then(r => r.json()).then(setCategories).catch(() => {});
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">{isEdit ? 'Edit Asset' : 'New Product Entry'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Product Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Recycled Jean Clutch"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-primary outline-none capitalize">
                <option value="">— Select —</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stock Qty</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-primary outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Base Price (VND)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-primary outline-none" />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="onSale" name="onSale" checked={form.onSale} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <label htmlFor="onSale" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Enable Sale Pricing</label>
            </div>

            {form.onSale && (
              <div className="col-span-2 bg-red-50/50 p-4 rounded-lg border border-red-100 space-y-1.5">
                <label className="text-xs font-bold text-red-700 uppercase tracking-wide">Original Price (Strikethrough)</label>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} required
                  className="w-full bg-white border border-red-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-red-500 outline-none" />
              </div>
            )}

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-primary outline-none resize-none" />
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Material</label>
                  <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Recycled Denim"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Inner Lining</label>
                  <input name="innerLining" value={form.innerLining} onChange={handleChange} placeholder="e.g. Cotton Canvas"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Number of Straps</label>
                  <input name="numberStraps" value={form.numberStraps} onChange={handleChange} placeholder="e.g. 1"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Detachable Strap</label>
                  <input name="detachableStrap" value={form.detachableStrap} onChange={handleChange} placeholder="Yes/No"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Adjustable Strap</label>
                  <input name="adjustableStrap" value={form.adjustableStrap} onChange={handleChange} placeholder="Yes/No"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Closure Type</label>
                  <input name="closureType" value={form.closureType} onChange={handleChange} placeholder="e.g. Zipper"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Inner Compartments</label>
                  <input name="innerCompartments" value={form.innerCompartments} onChange={handleChange} placeholder="e.g. 2 slots"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Dimensions</label>
                  <input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 20 x 15 x 5 cm"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                  <input name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 300g"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Care Instructions</label>
                  <input name="careInstructions" value={form.careInstructions} onChange={handleChange} placeholder="e.g. Hand wash only"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. sustainable, eco-friendly, clutch"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">Variants & Imagery</label>
              <button type="button" onClick={addColor} className="text-xs font-bold text-primary hover:underline">Add Variant</button>
            </div>
            <div className="space-y-3">
              {colorImages.map((entry, i) => (
                <ColorImageRow key={i} entry={entry} token={token} onChange={val => updateColor(i, val)} onRemove={() => removeColor(i)} />
              ))}
            </div>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Dismiss</button>
          <button onClick={handleSubmit} disabled={saving} className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
            {saving ? 'Syncing...' : 'Save Product Record'}
          </button>
        </div>
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
    if (!window.confirm('Erase this record permanently?')) return;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 font-medium">Inventory management and catalog control</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Product
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter catalog..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-900 focus:border-primary outline-none transition-all" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} records shown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">Accessing database...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">No results match your query</td></tr>
              ) : filtered.map(product => (
                <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative flex-shrink-0 flex items-center justify-center">
                        {product.onSale && <span className="absolute top-0 left-0 bg-red-600 text-white text-[7px] px-1.5 font-bold rounded-br-sm shadow-sm">SALE</span>}
                        <img alt={product.name} className="w-full h-full object-cover" src={getImgUrl(product.colorImages?.[0]?.image || product.image)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate uppercase">ID: {product._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-slate-600 font-medium">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${product.stock < 5 ? 'text-red-600' : 'text-slate-700'}`}>{product.stock} units</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.onSale && <span className="text-[10px] text-slate-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-white hover:shadow-md transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-white hover:shadow-md transition-all">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ProductModal product={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} token={user?.token} />}
    </AdminLayout>
  );
};

// ─── Order Detail Modal (Inspect Mode) ────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onUpdateStatus, token }) => {
  if (!order) return null;
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(order.comments || []);
  const [expandedDesign, setExpandedDesign] = useState(null); // Track index of item being inspected
  const [enlargedImage, setEnlargedImage] = useState(null); // Fullscreen image viewer
  const navigate = useNavigate();
  const fmt = d => new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setLocalComments([...localComments, newComment]);
        setCommentText('');
      }
    } catch (err) { console.error(err); }
  };

  const statusOrderArr = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const currentIndex = statusOrderArr.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center px-8 py-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Order #{order._id.slice(-8)}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Fulfillment Inspector</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md transition-all flex items-center justify-center text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Details</h3>
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-800">{order.recipientName}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-[18px] opacity-40">call</span> {order.phone}</p>
                  <p className="text-sm text-slate-600 flex items-start gap-2 leading-relaxed"><span className="material-symbols-outlined text-[18px] opacity-40 mt-0.5">location_on</span> {order.address}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Context</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Payment Method</span>
                  <span className="font-bold text-slate-800 uppercase text-xs">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <span className={`font-bold uppercase text-xs ${
                    order.paymentStatus === 'Paid' ? 'text-green-600' : 
                    order.paymentStatus === 'Failed' ? 'text-red-600' : 'text-amber-600'
                  }`}>{order.paymentStatus || 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Entry Date</span>
                  <span className="font-bold text-slate-800 text-xs">{fmt(order.createdAt)}</span>
                </div>
                {order.note && <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs italic text-slate-500">"{order.note}"</div>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">inventory</span> Inventory Verification
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => {
                  const product = item.product || {};
                  const stock = product.stock || 0;
                  const isAvailable = stock >= item.quantity;
                  return (
                    <div key={idx} className="flex items-center gap-6 bg-white border border-slate-100 rounded-xl p-4 hover:border-primary/30 transition-all shadow-sm">
                      <div 
                        className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center cursor-zoom-in group/img relative"
                        onClick={() => setEnlargedImage(getImgUrl(product.image))}
                      >
                        {product.image && <img src={getImgUrl(product.image)} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt={product.name} />}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">zoom_in</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-2 truncate">{product.name || 'Legacy Product'}</p>
                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8">
                          <div className="flex items-center gap-8">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Ordered</p>
                              <p className="text-sm font-bold text-primary">{item.quantity} Units</p>
                            </div>
                            <div className="flex items-end gap-3">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">In-Stock</div>
                                <p className={`text-sm font-bold ${stock < item.quantity ? 'text-red-600' : 'text-slate-800'}`}>{stock} Units</p>
                              </div>
                              {isAvailable && (
                                <span className="flex items-center gap-1.5 text-[8px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-100 mb-1 whitespace-nowrap">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready to pack
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Simplified Admin Customization Detail */}
                          {item.isCustomized && (
                            <div className="min-w-0">
                              <button 
                                onClick={() => setExpandedDesign(expandedDesign === idx ? null : idx)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-widest transition-all ${
                                  expandedDesign === idx ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">{expandedDesign === idx ? 'expand_less' : 'expand_more'}</span>
                                {expandedDesign === idx ? 'Hide Custom' : 'View Custom Design'}
                              </button>

                              {expandedDesign === idx && (
                                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-300 w-full max-w-2xl">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Text Info */}
                                    <div className="space-y-3">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Custom Name</span>
                                        <p className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 italic">"{item.customName}"</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase">Font</span>
                                          <p className="text-xs text-slate-700">{item.fontFamily === 'Mrs Saint Delafield' ? 'Cursive' : 'Formal'}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase">Style</span>
                                          <p className="text-xs text-slate-700">
                                            {[item.fontWeight === 'bold' && 'Bold', item.fontStyle === 'italic' && 'Italic'].filter(Boolean).join(', ') || 'Normal'}
                                          </p>
                                        </div>
                                      </div>
                                      {(item.selectedIconLeft || item.selectedIconRight) && (
                                        <div className="flex gap-4 border-t border-slate-200 pt-2">
                                          {item.selectedIconLeft && (
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">Icon Left</span>
                                              <span className="material-symbols-outlined text-slate-700 text-[18px]">{item.selectedIconLeft}</span>
                                            </div>
                                          )}
                                          {item.selectedIconRight && (
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">Icon Right</span>
                                              <span className="material-symbols-outlined text-slate-700 text-[18px]">{item.selectedIconRight}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex flex-col gap-1 border-t border-slate-200 pt-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Coordinates</span>
                                        <p className="text-[10px] font-mono text-slate-500">X: {Math.round(item.embroideryPos?.x)}% | Y: {Math.round(item.embroideryPos?.y)}%</p>
                                      </div>
                                    </div>

                                    {/* Previews */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase px-1">Macro</span>
                                        <div 
                                          className="aspect-square bg-white rounded border border-slate-200 overflow-hidden cursor-zoom-in group/zoom relative"
                                          onClick={() => item.customPreviewFabric && setEnlargedImage(item.customPreviewFabric)}
                                        >
                                          {item.customPreviewFabric ? (
                                            <>
                                              <img src={item.customPreviewFabric} className="w-full h-full object-cover transition-transform group-hover/zoom:scale-110" />
                                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-sm">zoom_in</span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">N/A</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase px-1">Placement</span>
                                        <div 
                                          className="aspect-square bg-white rounded border border-slate-200 overflow-hidden cursor-zoom-in group/zoom relative"
                                          onClick={() => item.customPreviewPlacement && setEnlargedImage(item.customPreviewPlacement)}
                                        >
                                          {item.customPreviewPlacement ? (
                                            <>
                                              <img src={item.customPreviewPlacement} className="w-full h-full object-cover transition-transform group-hover/zoom:scale-110" />
                                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-sm">zoom_in</span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">N/A</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isAvailable && (
                            <div className="flex-grow flex justify-end">
                              <button onClick={() => navigate(`/admin/products?search=${encodeURIComponent(product.name || '')}`)}
                                className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-wide bg-red-50 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">warning</span> Restock
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">history</span> Operational Logs
              </h3>
              <div className="space-y-3 pl-8 border-l-2 border-slate-50">
                {order.history?.length > 0 ? order.history.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs relative">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-primary absolute -left-[35px] shadow-sm"></div>
                    <span className="font-bold text-primary uppercase w-20">{h.status}</span>
                    <span className="text-slate-500 font-medium">Stage advanced by <span className="font-bold text-slate-800">{h.user}</span></span>
                    <span className="ml-auto text-[10px] font-bold text-slate-300 uppercase">{fmt(h.changedAt)}</span>
                  </div>
                )) : <p className="text-xs text-slate-400 italic">No operational transitions recorded.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col h-[500px] shadow-inner overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">forum</span> Internal Discussion
                </h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{localComments.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {localComments.map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary uppercase">{c.author}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="p-4 bg-white border-t border-slate-200">
                <div className="relative">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Type a note..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-primary transition-all font-medium" />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liquid Order Value</p>
            <p className="text-3xl font-bold text-primary tracking-tighter">{formatPrice(order.totalAmount)}</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-white hover:shadow-md transition-all">Dismiss</button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            {currentIndex > 0 && order.status !== 'cancelled' && (
              <button onClick={() => { onUpdateStatus(order._id, statusOrderArr[currentIndex - 1]); onClose(); }}
                className="px-6 py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all flex items-center gap-2 uppercase tracking-wide">
                <span className="material-symbols-outlined text-[18px]">undo</span> Move Back
              </button>
            )}

            {currentIndex < 3 && order.status !== 'cancelled' && (
              <button onClick={() => { onUpdateStatus(order._id, statusOrderArr[currentIndex + 1]); onClose(); }}
                className="px-8 py-2.5 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                Next Stage <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            )}

            {order.status === 'delivered' && (
              <span className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-6 py-2.5 rounded-lg border border-green-100 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">check_circle</span> Process Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer / Lightbox */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" 
          onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
        >
          <div className="absolute top-6 right-6 flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(enlargedImage, '_blank'); }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
              title="Open Original"
            >
              <span className="material-symbols-outlined">open_in_new</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
            >
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
          </div>
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <img 
              src={enlargedImage} 
              className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500 pointer-events-auto cursor-zoom-out" 
              alt="Enlarged view" 
              onClick={e => { e.stopPropagation(); setEnlargedImage(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin Orders Page (Kanban Board) ──────────────────────────────────────────
const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
      const d = await res.json();
      setOrders(Array.isArray(d) ? d : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const updateStatus = async (orderId, status) => {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchOrders();
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.phone && o.phone.includes(searchTerm))
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Fulfillment</h1>
          <p className="text-sm text-slate-500 font-medium italic">Operational pipeline and order queue</p>
        </div>
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter queue..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-primary outline-none transition-all shadow-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-primary"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Board...</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[75vh] items-stretch custom-scrollbar">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { height: 10px; display: block !important; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 20px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 3px solid white; shadow-lg; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
          {statusOrder.map(status => (
            <div key={status} className="flex-shrink-0 w-80 bg-slate-100/50 rounded-xl flex flex-col border border-slate-200 shadow-inner overflow-hidden"
              onDragOver={e => e.preventDefault()} onDrop={e => { const id = e.dataTransfer.getData('orderId'); if (id) updateStatus(id, status); }}>
              <div className="px-5 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{status}</h2>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{filteredOrders.filter(o => o.status === status).length}</span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto no-scrollbar max-h-[calc(100vh-280px)]">
                {filteredOrders.filter(o => o.status === status).map(order => (
                  <div key={order._id} draggable onDragStart={e => e.dataTransfer.setData('orderId', order._id)} onClick={() => setSelectedOrder(order)}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter border-b border-slate-100 pb-0.5">#{order._id.slice(-6)}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-primary transition-colors truncate uppercase tracking-tight">{order.recipientName}</div>
                    <div className="text-[10px] text-slate-400 font-medium mb-5 flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[12px]">location_on</span> {order.address}</div>
                    <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-widest">Liquid Value</span>
                        <span className="text-xs font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex -space-x-2.5">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 overflow-hidden shadow-sm ring-1 ring-slate-100">
                            {item.product?.image && <img src={getImgUrl(item.product.image)} className="w-full h-full object-cover" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} token={user?.token} />}
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
      const res = await fetch(`${API_BASE}/api/auth/admins`, { headers: { Authorization: `Bearer ${user.token}` } });
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
        setMessage({ type: 'success', text: 'Account provisioned successfully' });
        setName(''); setPass(''); fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) { setMessage({ type: 'error', text: 'Network request failed' }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (id === user._id) return alert('Self-termination restricted');
    if (!window.confirm('Revoke access for this administrator?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) fetchAdmins();
    } catch (err) { console.error(err); }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase font-black">Personnel</h1>
        <p className="text-sm text-slate-500 font-medium italic opacity-70">Manage administrative access control</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <span className="material-symbols-outlined text-primary">person_add</span> Provision Access
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="User alias"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-primary outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Token</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Password phrase"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-primary outline-none" />
            </div>
            {message.text && <div className={`p-4 rounded-lg text-xs font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{message.text}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
              {loading ? 'Provisioning...' : 'Activate Account'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Personnel</h2>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto no-scrollbar max-h-[450px]">
            {fetching ? (
              <div className="p-12 text-center text-slate-400 italic text-sm animate-pulse">Scanning records...</div>
            ) : admins.map(admin => (
              <div key={admin._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-white shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{admin.name} {admin._id === user._id && <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1 font-bold uppercase tracking-widest">OWNER</span>}</p>
                    <p className="text-[10px] text-slate-400 font-medium">SID: {admin._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                {admin._id !== user._id && (
                  <button onClick={() => handleDelete(admin._id)} className="p-sm text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50">
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

// ─── Admin Analytics Dashboard ───────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetch(`${API_BASE}/api/orders/dashboard-stats`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <AdminLayout><div className="text-center py-24 italic text-slate-400 animate-pulse text-sm">Synchronizing business metrics...</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="text-center py-24 text-red-500 font-bold text-sm uppercase tracking-widest">Data Stream Link Failed</div></AdminLayout>;

  const maxSale = Math.max(...data.monthlySales.map(m => m.amount), 1);
  const getMonthLabel = (m) => new Date(0, m-1).toLocaleString('en-US', { month: 'short' });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase font-black">Overview</h1>
          <p className="text-sm text-slate-500 font-medium italic opacity-70">Real-time performance metrics</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Network Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Gross Revenue', value: formatPrice(data.totalRevenue), icon: 'payments' },
          { label: 'Volume Orders', value: data.ordersCount, icon: 'shopping_bag' },
          { label: 'Active Catalog', value: data.productsCount, icon: 'inventory_2' },
          { label: 'Admin Personnel', value: data.usersCount, icon: 'group' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </div>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Real-time</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <span className="material-symbols-outlined text-primary">trending_up</span> Revenue Trajectory
          </h2>
          <div className="flex-grow flex items-end gap-3 md:gap-6 px-4 border-b border-l border-slate-100 pb-4 h-64 min-h-[300px]">
            {data.monthlySales.map((m, i) => {
              const height = (m.amount / maxSale) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl z-20 whitespace-nowrap">{formatPrice(m.amount)}</div>
                  <div className="w-full bg-slate-100 group-hover:bg-primary rounded-t-lg transition-all duration-700 relative overflow-hidden" style={{ height: `${height}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                  </div>
                  <span className="absolute -bottom-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getMonthLabel(m._id.month)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-16 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic font-medium">6-Month Automated Revenue Analysis</p>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8 font-black">
            <span className="material-symbols-outlined text-secondary">workspace_premium</span> Top Assets
          </h2>
          <div className="space-y-6">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <Link to={`/products/${p.productDetails._id}`} className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm block border border-slate-100">
                  <img src={getImgUrl(p.productDetails.colorImages?.[0]?.image || p.productDetails.image)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute top-0 left-0 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-br-lg shadow-md">#{i+1}</div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p.productDetails._id}`} className="block hover:underline decoration-primary/30">
                    <p className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight mb-1">{p.productDetails.name}</p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60" style={{ width: `${(p.count / data.topProducts[0].count) * 100}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">{p.count} Sold</span>
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
