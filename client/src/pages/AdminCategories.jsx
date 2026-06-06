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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
    <div className="bg-background text-on-background min-h-screen flex w-full font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-low border-r border-outline-variant/30 px-lg py-xl flex flex-col transition-transform duration-300 lg:sticky lg:translate-x-0 h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-xxl flex flex-col gap-xs">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center h-8">
              {headerLogo ? (
                <img src={getImgUrl(headerLogo)} alt="Loom" className="h-full w-auto object-contain" />
              ) : (
                <span className="text-primary font-bold text-xl tracking-widest uppercase">LOOM</span>
              )}
            </Link>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-on-surface-variant hover:text-primary p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="font-label-caps text-[10px] font-bold text-on-surface-variant mt-xs tracking-wider opacity-60">Admin Panel</div>
        </div>

        <nav className="flex-1 flex flex-col gap-xl overflow-y-auto no-scrollbar">
          {sections.map(section => (
            <div key={section.title} className="flex flex-col gap-sm">
              <h3 className="px-md text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">{section.title}</h3>
              <div className="flex flex-col gap-xs">
                {section.items.map(item => (
                  <Link 
                    key={item.to} 
                    to={item.to}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-md px-md py-sm rounded transition-colors ${path === item.to ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                  >
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-md border-b border-outline-variant/30 bg-surface-container-low sticky top-0 z-30">
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/" className="h-6">
            {headerLogo ? (
              <img src={getImgUrl(headerLogo)} alt="Loom" className="h-full w-auto object-contain" />
            ) : (
              <span className="text-primary font-bold text-lg tracking-widest uppercase">LOOM</span>
            )}
          </Link>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-md md:p-xl overflow-x-hidden">{children}</main>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full max-w-md shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-4 sm:px-xl py-4 sm:py-lg border-b border-outline-variant/20">
          <h2 className="font-headline-md text-base sm:text-headline-md text-primary">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:px-xl sm:py-lg flex flex-col gap-6 sm:gap-lg overflow-y-auto">
          {error && <div className="bg-error/10 text-error p-sm rounded text-xs font-bold">{error}</div>}

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Category Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Moonlight"
              className="w-full bg-surface-container border border-outline-variant/50 rounded px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none" />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Image Asset</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-24 h-24 sm:h-24 rounded-xl overflow-hidden bg-surface-variant border border-outline-variant/30 flex-shrink-0 flex items-center justify-center">
                {image ? <img src={getImgUrl(image)} alt={name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined opacity-30 text-3xl">image</span>}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className={`flex items-center justify-center gap-2 px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] ${uploading ? 'opacity-50' : ''}`}>
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
                <input value={image} onChange={e => setImage(e.target.value)} placeholder="or paste image URL"
                  className="bg-transparent border-b border-outline-variant/30 py-1.5 text-xs text-on-surface focus:border-primary outline-none w-full" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-outline-variant/20">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-outline-variant/50 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-variant transition-colors text-[11px]">Cancel</button>
            <button type="submit" disabled={saving} className="px-8 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps hover:opacity-90 disabled:opacity-60 text-[11px]">
              {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Add Collection'}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-xl">
        <div className="space-y-1.5">
          <h1 className="font-headline-lg text-headline-lg text-primary font-normal">Categories</h1>
          <p className="text-sm text-on-surface-variant">Organize and manage your product collections</p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 uppercase tracking-widest mt-3">
            {categories.length} Total Collections
          </div>
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
