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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
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

        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-[10px] text-on-surface-variant">Title</label>
            <input value={banner.title || ''} onChange={e => onChange({ ...banner, title: e.target.value })}
              placeholder="e.g. Recycled Excellence" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-[10px] text-on-surface-variant">Subtitle</label>
            <input value={banner.subtitle || ''} onChange={e => onChange({ ...banner, subtitle: e.target.value })}
              placeholder="e.g. Crafted for the future" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-[10px] text-on-surface-variant">Link URL</label>
            <input value={banner.link || ''} onChange={e => onChange({ ...banner, link: e.target.value })}
              placeholder="e.g. /collection" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none" />
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
  const [giftPage, setGiftPage] = useState({ banner: '', product1: '', product2: '' });
  const [products, setProducts] = useState([]);
  const [homeEthos, setHomeEthos] = useState({ image: '', label: '', title: '', description: '' });
  const [shippingPolicyImage, setShippingPolicyImage] = useState('');
  const [returnPolicyImage, setReturnPolicyImage] = useState('');
  const [careInstructionsImage, setCareInstructionsImage] = useState('');
  const [headerLogo, setHeaderLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    
    // Fetch products for selection
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);

    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => {
        setBanners(data.banners || []);
        setCollectionBanner(data.collectionBanner || '');
        setHeaderLogo(data.headerLogo || '');
        setAboutPage(prev => ({
          ...prev,
          ...(data.aboutPage || {})
        }));
        setGiftPage({
          banner: data.giftPage?.banner || '',
          product1: data.giftPage?.product1?._id || data.giftPage?.product1 || '',
          product2: data.giftPage?.product2?._id || data.giftPage?.product2 || ''
        });
        setHomeEthos(data.homeEthos || { image: '', label: '', title: '', description: '' });
        setShippingPolicyImage(data.shippingPolicyImage || '');
        setReturnPolicyImage(data.returnPolicyImage || '');
        setCareInstructionsImage(data.careInstructionsImage || '');
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
          homeEthos,
          giftPage,
          shippingPolicyImage,
          returnPolicyImage,
          careInstructionsImage,
          headerLogo
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
        {/* Header Logo Section */}
        <section className="flex flex-col gap-lg border-b border-outline-variant/30 pb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Header Logo</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-md">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Logo Image (Horizontal Text Logo)</label>
            <div className="flex items-center gap-md">
              <div className="w-48 h-16 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30 flex items-center justify-center p-sm">
                {headerLogo ? <img src={getImgUrl(headerLogo)} alt="header logo" className="max-w-full max-h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
              </div>
              <div className="flex-1 flex flex-col gap-sm">
                <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setHeaderLogo)} />
                </label>
                <input value={headerLogo} onChange={e => setHeaderLogo(e.target.value)}
                  placeholder="or paste logo image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
              </div>
            </div>
            <p className="text-xs text-on-surface-variant opacity-70">Recommended: Transparent background horizontal logo.</p>
          </div>
        </section>

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
              <input value={aboutPage.title || ''} onChange={e => setAboutPage({...aboutPage, title: e.target.value})}
                placeholder="e.g. Our Story" className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none w-full" />
            </div>

            {/* About Description */}
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Description</label>
              <textarea value={aboutPage.description || ''} onChange={e => setAboutPage({...aboutPage, description: e.target.value})}
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

        {/* Gift Page Section */}
        <section className="flex flex-col gap-lg border-t border-outline-variant/30 pt-xl pb-xxl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Gift Page</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-lg">
            {/* Gift Banner */}
            <div className="flex flex-col gap-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Hero Banner</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {giftPage.banner ? <img src={getImgUrl(giftPage.banner)} alt="gift banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <div className="flex-1 flex flex-col gap-sm">
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Banner
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setGiftPage({...giftPage, banner: url}))} />
                  </label>
                  <input value={giftPage.banner} onChange={e => setGiftPage({...giftPage, banner: e.target.value})}
                    placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
                </div>
              </div>
            </div>

            {/* Featured Product 1 */}
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Featured Gift 1</label>
              <div className="flex items-center gap-md">
                <div className="w-20 h-20 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {giftPage.product1 && products.find(p => p._id === giftPage.product1) ? (
                    <img 
                      src={getImgUrl(products.find(p => p._id === giftPage.product1).colorImages?.[0]?.image || products.find(p => p._id === giftPage.product1).image)} 
                      alt="gift 1" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                  )}
                </div>
                <select 
                  value={giftPage.product1} 
                  onChange={e => setGiftPage({...giftPage, product1: e.target.value})}
                  className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none flex-1"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured Product 2 */}
            <div className="flex flex-col gap-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Featured Gift 2</label>
              <div className="flex items-center gap-md">
                <div className="w-20 h-20 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {giftPage.product2 && products.find(p => p._id === giftPage.product2) ? (
                    <img 
                      src={getImgUrl(products.find(p => p._id === giftPage.product2).colorImages?.[0]?.image || products.find(p => p._id === giftPage.product2).image)} 
                      alt="gift 2" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                  )}
                </div>
                <select 
                  value={giftPage.product2} 
                  onChange={e => setGiftPage({...giftPage, product2: e.target.value})}
                  className="bg-surface border border-outline-variant/30 rounded p-md text-on-surface focus:border-primary outline-none flex-1"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Images Section */}
        <section className="flex flex-col gap-lg border-t border-outline-variant/30 pt-xl pb-xxl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Policy Pages (Images)</h2>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-lg flex flex-col gap-lg">
            {/* Shipping Policy */}
            <div className="flex flex-col gap-md">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Shipping Policy Image</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {shippingPolicyImage ? <img src={getImgUrl(shippingPolicyImage)} alt="shipping policy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <div className="flex-1 flex flex-col gap-sm">
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setShippingPolicyImage)} />
                  </label>
                  <input value={shippingPolicyImage} onChange={e => setShippingPolicyImage(e.target.value)}
                    placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className="flex flex-col gap-md border-t border-outline-variant/20 pt-lg">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Return & Exchange Policy Image</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {returnPolicyImage ? <img src={getImgUrl(returnPolicyImage)} alt="return policy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <div className="flex-1 flex flex-col gap-sm">
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setReturnPolicyImage)} />
                  </label>
                  <input value={returnPolicyImage} onChange={e => setReturnPolicyImage(e.target.value)}
                    placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="flex flex-col gap-md border-t border-outline-variant/20 pt-lg">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Care Instructions Image</label>
              <div className="flex items-center gap-md">
                <div className="w-40 h-24 bg-surface-variant rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  {careInstructionsImage ? <img src={getImgUrl(careInstructionsImage)} alt="care instructions" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><span className="material-symbols-outlined">image</span></div>}
                </div>
                <div className="flex-1 flex flex-col gap-sm">
                  <label className="flex items-center justify-center gap-xs px-md py-sm rounded border border-outline-variant/50 cursor-pointer hover:bg-surface-variant transition-colors font-label-caps text-label-caps text-on-surface-variant text-[12px] w-fit">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setCareInstructionsImage)} />
                  </label>
                  <input value={careInstructionsImage} onChange={e => setCareInstructionsImage(e.target.value)}
                    placeholder="or paste image URL" className="bg-transparent border-b border-outline-variant/30 py-xs text-sm text-on-surface focus:border-primary outline-none w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
