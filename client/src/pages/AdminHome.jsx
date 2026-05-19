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
  const [collectionBanner, setCollectionBanner] = useState('');
  const [aboutPage, setAboutPage] = useState({ 
    banner: '', title: '', description: '', 
    missionTitle: '', missionDescription1: '', missionDescription2: '', missionImage: '',
    spotlightTitle: '', spotlightDescription: '', spotlightImage: '' 
  });
  const [homeEthos, setHomeEthos] = useState({ image: '', label: '', title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => {
        setBanners(data.banners || []);
        setCollectionBanner(data.collectionBanner || '');
        setAboutPage(data.aboutPage || {});
        setHomeEthos(data.homeEthos || { image: '', label: '', title: '', description: '' });
      })
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
        body: JSON.stringify({ 
          banners: banners.filter(b => b.image),
          collectionBanner,
          aboutPage,
          homeEthos
        }),
      });
      if (res.ok) alert('Settings updated successfully!');
      else alert('Failed to update settings');
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, user.token);
      callback(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Website Settings</h1>
          <p className="text-sm text-on-surface-variant mt-xs">Manage your homepage, collection, and about page content</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="flex flex-col gap-xxl max-w-4xl">
        {/* Hero Banners Section */}
        <section className="flex flex-col gap-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface">Home Hero Banners</h2>
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
        </section>

        {/* Home Ethos Section */}
        <section className="flex flex-col gap-lg border-t border-outline-variant/30 pt-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Home Materials Section</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-lg">
            <div className="flex flex-col gap-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Section Image</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {homeEthos.image ? <img src={getImgUrl(homeEthos.image)} alt="home ethos" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setHomeEthos({...homeEthos, image: url}))} />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Label (e.g. Sustainable by Choice)</label>
              <input value={homeEthos.label || ''} onChange={e => setHomeEthos({...homeEthos, label: e.target.value})}
                className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
            </div>
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Title (e.g. Crafted with Intention)</label>
              <input value={homeEthos.title || ''} onChange={e => setHomeEthos({...homeEthos, title: e.target.value})}
                className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
            </div>
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Description</label>
              <textarea value={homeEthos.description || ''} onChange={e => setHomeEthos({...homeEthos, description: e.target.value})}
                rows={4} className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full resize-none" />
            </div>
          </div>
        </section>

        {/* Collection Page Section */}
        <section className="flex flex-col gap-lg border-t border-outline-variant/30 pt-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Collection Page</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-md">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Banner Image</label>
            <div className="flex items-center gap-md">
              <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                {collectionBanner ? <img src={getImgUrl(collectionBanner)} alt="collection banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
              </div>
              <div className="flex-1 flex flex-col gap-sm">
                <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload Banner
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setCollectionBanner)} />
                </label>
                <input value={collectionBanner} onChange={e => setCollectionBanner(e.target.value)}
                  placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
              </div>
            </div>
          </div>
        </section>

        {/* About Page Section */}
        <section className="flex flex-col gap-lg border-t border-outline-variant/30 pt-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">About Page</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-lg">
            {/* About Banner */}
            <div className="flex flex-col gap-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Hero Banner</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {aboutPage.banner ? <img src={getImgUrl(aboutPage.banner)} alt="about banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <div className="flex-1 flex flex-col gap-sm">
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Banner
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setAboutPage({...aboutPage, banner: url}))} />
                  </label>
                  <input value={aboutPage.banner} onChange={e => setAboutPage({...aboutPage, banner: e.target.value})}
                    placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
                </div>
              </div>
            </div>

            {/* About Title */}
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Page Title</label>
              <input value={aboutPage.title} onChange={e => setAboutPage({...aboutPage, title: e.target.value})}
                placeholder="e.g. Our Story" className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
            </div>

            {/* About Description */}
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Description</label>
              <textarea value={aboutPage.description} onChange={e => setAboutPage({...aboutPage, description: e.target.value})}
                placeholder="Enter about page description..." rows={4} className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full resize-none" />
            </div>

            {/* Mission Section */}
            <div className="border-t border-outline-variant/20 pt-lg flex flex-col gap-lg">
              <h3 className="font-headline-sm text-on-surface">Mission Section</h3>
              <div className="flex flex-col gap-md">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Mission Image</label>
                <div className="flex items-center gap-md">
                  <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                    {aboutPage.missionImage ? <img src={getImgUrl(aboutPage.missionImage)} alt="mission" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                  </div>
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setAboutPage({...aboutPage, missionImage: url}))} />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Mission Title</label>
                <input value={aboutPage.missionTitle || ''} onChange={e => setAboutPage({...aboutPage, missionTitle: e.target.value})}
                  className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Mission Paragraph 1</label>
                <textarea value={aboutPage.missionDescription1 || ''} onChange={e => setAboutPage({...aboutPage, missionDescription1: e.target.value})}
                  rows={3} className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full resize-none" />
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Mission Paragraph 2</label>
                <textarea value={aboutPage.missionDescription2 || ''} onChange={e => setAboutPage({...aboutPage, missionDescription2: e.target.value})}
                  rows={3} className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full resize-none" />
              </div>
            </div>

            {/* Spotlight Section */}
            <div className="border-t border-outline-variant/20 pt-lg flex flex-col gap-lg">
              <h3 className="font-headline-sm text-on-surface">Material Spotlight Section</h3>
              <div className="flex flex-col gap-md">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Spotlight Image</label>
                <div className="flex items-center gap-md">
                  <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                    {aboutPage.spotlightImage ? <img src={getImgUrl(aboutPage.spotlightImage)} alt="spotlight" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                  </div>
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setAboutPage({...aboutPage, spotlightImage: url}))} />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Spotlight Title</label>
                <input value={aboutPage.spotlightTitle || ''} onChange={e => setAboutPage({...aboutPage, spotlightTitle: e.target.value})}
                  className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
              </div>
              <div className="flex flex-col gap-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Spotlight Description</label>
                <textarea value={aboutPage.spotlightDescription || ''} onChange={e => setAboutPage({...aboutPage, spotlightDescription: e.target.value})}
                  rows={3} className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full resize-none" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
