/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getImgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

export const uploadImage = async (file, token) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
};

// ─── Shared Admin Layout (Reverted to Original Style) ─────────────────────────
export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout, headerLogo } = useAuth();
  const navigate = useNavigate();
  const path = location.pathname;
  const handleLogout = () => { logout(); navigate('/login'); };

  const sections = [
    {
      title: 'Analytics',
      items: [
        { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { to: '/admin/products', icon: 'inventory_2', label: 'Products' },
        { to: '/admin/categories', icon: 'category', label: 'Categories' },
      ]
    },
    {
      title: 'Management',
      items: [
        { to: '/admin/users', icon: 'manage_accounts', label: 'Admins' },
        { to: '/admin/home', icon: 'settings', label: 'Website Settings' },
      ]
    }
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex w-full font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif !important; }
      `}</style>
      
      <aside className="w-64 bg-surface-container-low min-h-screen border-r border-outline-variant/30 px-lg py-xl flex flex-col sticky top-0 h-screen">
        <div className="mb-xxl flex flex-col gap-xs">
          <Link to="/" className="flex items-center h-8">
            {headerLogo ? (
              <img src={getImgUrl(headerLogo)} alt="Loom" className="h-full w-auto object-contain" />
            ) : (
              <span className="text-primary font-bold text-xl tracking-widest">LOOM</span>
            )}
          </Link>
          <div className="font-label-caps text-[10px] font-bold text-on-surface-variant mt-xs tracking-wider opacity-60">Admin Panel</div>
        </div>

        <nav className="flex-1 flex flex-col gap-xl overflow-y-auto no-scrollbar">
          {sections.map(section => (
            <div key={section.title} className="flex flex-col gap-sm">
              <h3 className="px-md text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">{section.title}</h3>
              <div className="flex flex-col gap-xs">
                {section.items.map(item => (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-md px-md py-sm rounded transition-colors ${path === item.to ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="font-label-caps text-[11px] font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-outline-variant/30 pt-lg">
          <div className="font-body-md text-sm text-on-surface-variant mb-sm truncate font-medium">{user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-sm text-on-surface-variant hover:text-error transition-colors font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[18px]">logout</span> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-xl overflow-x-hidden">{children}</main>
    </div>
  );
};

// ─── Category Modal ───────────────────────────────────────────────────────────
const CategoryModal = ({ category, onClose, onSave, token }) => {
  const isEdit = !!category?._id;
  const [name, setName] = useState(category?.name || '');
  const [image, setImage] = useState(category?.image || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file, token); setImage(url); }
    catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEdit
        ? `${API_BASE}/api/categories/${category._id}`
        : `${API_BASE}/api/categories`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSave(data, isEdit);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-md">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-xl py-lg border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md text-primary">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-xl py-lg flex flex-col gap-lg">
          {error && <div className="bg-error/10 text-error p-sm rounded text-sm">{error}</div>}

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Category Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Moonlight"
              className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Image</label>
            <div className="flex items-center gap-md">
              {image && <img src={getImgUrl(image)} alt={name} className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />}
              <div className="flex flex-col gap-sm flex-1">
                <label className={`flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-sm ${uploading ? 'opacity-50' : ''}`}>
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
                <input value={image} onChange={e => setImage(e.target.value)} placeholder="or paste image URL"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded px-md py-sm text-sm text-on-surface focus:border-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-md justify-end pt-md border-t border-outline-variant/20">
            <button type="button" onClick={onClose} className="px-lg py-sm border border-outline-variant/50 rounded font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded font-label-caps text-label-caps hover:opacity-90 disabled:opacity-60">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Admin Categories Page ────────────────────────────────────────────────────
export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/categories`);
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchCategories();
  }, [user, navigate, fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` }
    });
    setCategories(prev => prev.filter(c => c._id !== id));
  };

  const handleSave = (saved, isEdit) => {
    if (isEdit) setCategories(prev => prev.map(c => c._id === saved._id ? saved : c));
    else setCategories(prev => [...prev, saved]);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Categories</h1>
          <p className="text-sm text-on-surface-variant mt-xs">{categories.length} total</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-sm bg-primary text-on-primary font-label-caps text-label-caps px-lg py-md rounded-xl hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-xl text-on-surface-variant">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant">No categories yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
          {categories.map(cat => (
            <div key={cat._id} className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-surface-container relative overflow-hidden">
                {cat.image
                  ? <img src={getImgUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-30">image</span>
                    </div>}
              </div>
              <div className="px-md py-sm flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface capitalize">{cat.name}</span>
                <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(cat)} className="p-xs text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="p-xs text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          token={user?.token}
        />
      )}
    </AdminLayout>
  );
};
