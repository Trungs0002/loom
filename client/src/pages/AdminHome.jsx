/* eslint-disable */
import API_BASE from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLayout, uploadImage, getImgUrl } from './AdminCategories';

const BannerRow = ({ banner, onChange, onRemove, token }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { onChange({ ...banner, image: await uploadImage(file, token) }); }
    catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-md relative group">
      <button onClick={onRemove} className="absolute top-md right-md text-on-surface-variant hover:text-error transition-colors">
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>
      
      <div className="grid grid-cols-1 gap-lg">
        <div className="flex flex-col gap-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">Banner Image</label>
          <div className="flex items-center gap-md">
            <div className="w-24 h-16 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
              {banner.image ? <img src={getImgUrl(banner.image)} alt="banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
            </div>
            <div className="flex-1 flex flex-col gap-xs">
               <label className={`flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] ${uploading ? 'opacity-50' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
              <input value={banner.image} onChange={e => onChange({ ...banner, image: e.target.value })}
                placeholder="or paste URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-xs text-on-surface focus:border-primary outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminHome = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => setBanners(data.banners || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const addBanner = () => setBanners([...banners, { image: '', link: '/collection', title: '', subtitle: '' }]);
  const updateBanner = (i, val) => setBanners(prev => prev.map((b, idx) => idx === i ? val : b));
  const removeBanner = (i) => setBanners(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/home`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ banners: banners.filter(b => b.image) }),
      });
      if (res.ok) alert('Home settings updated successfully!');
      else alert('Failed to update settings');
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Home Settings</h1>
          <p className="text-sm text-on-surface-variant mt-xs">Manage your homepage banners</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex flex-col gap-lg max-w-4xl">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Hero Banners</h2>
          <button onClick={addBanner} className="flex items-center gap-xs text-primary font-label-caps text-[12px] hover:opacity-70">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Banner
          </button>
        </div>

        {loading ? <div className="text-center py-xl text-on-surface-variant">Loading...</div>
          : banners.length === 0 ? <div className="text-center py-xl text-on-surface-variant bg-surface-container rounded-xl">No banners yet. Click "Add Banner" to start.</div>
          : (
            <div className="flex flex-col gap-md">
              {banners.map((b, i) => (
                <BannerRow key={i} banner={b} onChange={val => updateBanner(i, val)} onRemove={() => removeBanner(i)} token={user.token} />
              ))}
            </div>
          )}
      </div>
    </AdminLayout>
  );
};
