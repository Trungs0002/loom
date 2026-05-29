/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';
import { getImgUrl } from './AdminCategories';

const About = () => {
  const [settings, setSettings] = useState({
    banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaPYMaiQe0s4wgYylHTX3to9okdYtXdfgL5DEFpiNSIL6WJ2x3SkYnsnYGE_DUCbHaf9ejPgD1DL5kmDz5wCx9af7mJe18jcFDyxhkCPNeMfOeyZ1QDob6ODHDqvbsD9_tYaWRRgL8s9UgB47aSbivKhZlfC1501SaTaUCk3qbkcCWbzZ_pRqZnRtBW2utMKT-S25X3C3COHOG6ETOLiMu9m96bdQRQOfIIxA3ci5688YTOJhR9XveHYJpYxEcN3ukyfB57llzmpU",
    title: "Our Story",
    description: "Loom was founded on the belief that luxury should not come at the cost of our planet. We redefine elegance through sustainable innovation.",
    missionTitle: "Elegance with a Purpose",
    missionDescription1: "At Loom, we don't just make bags; we create symbols of change. Our mission is to eliminate the concept of \"waste\" by transforming discarded materials into high-end fashion staples.",
    missionDescription2: "Every design is born from a desire for minimalism and a commitment to longevity. We believe in buying less but buying better—pieces that stand the test of time both in quality and style.",
    missionImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvDxFiEhNKrrtjVprXgItoY0V2MpLUTRYOl3twUpwxGp2egcZRSfyxN0-uWALUqxTTo4USfifPLZSFPecftvwteEKpbEyh5Jltmo5XhlIh-uoWKa8vroI2xpEjMU6mzfHPYlX-19ttxhBdc5LfbM7oxtopYcya9H8FXoFQFxjhnFhEnUNXwrzkJmM9PwMPt1YqkJG8CwcrP2kdEs61NsaIt8B4KI2klmj2KumeCsaU8-S0XDLpgWYD7sNpcgwW4e7KxPw1YqLhWWI",
    spotlightTitle: "Recycled Denim: Our Signature",
    spotlightDescription: "We specialize in transforming vintage denim and post-consumer textile waste into premium fabrics. This process saves thousands of gallons of water and prevents tons of fabric from reaching landfills.",
    spotlightImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhnk20scGCchHeulXPn_48JVAc_YrBf_XDGsn9LyynbXqXDDpcSPjtTBXcA5Ja2gB2DM2_ZPHc8P8YIyma5XbKy03N7XcLGvDidbfPux776krFzT1icHOOx3r_oh1G8DsUR28pZ71vG1at6HSmBUIwUBdfJLCgWJRzVsYqJOHMV7aFKscZZv7w3RkeI94XIIhn1ihlPvl4CRiXIxteib5FB_9Wd-x9echkbLlmGJplZHdt-TkJgcKTN0VeihaJtN2j45bmco687Fw"
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => {
        if (data.aboutPage) {
          setSettings(prev => ({
            ...prev,
            banner: data.aboutPage.banner || prev.banner,
            title: data.aboutPage.title || prev.title,
            description: data.aboutPage.description || prev.description,
            missionTitle: data.aboutPage.missionTitle || prev.missionTitle,
            missionDescription1: data.aboutPage.missionDescription1 || prev.missionDescription1,
            missionDescription2: data.aboutPage.missionDescription2 || prev.missionDescription2,
            missionImage: data.aboutPage.missionImage || prev.missionImage,
            spotlightTitle: data.aboutPage.spotlightTitle || prev.spotlightTitle,
            spotlightDescription: data.aboutPage.spotlightDescription || prev.spotlightDescription,
            spotlightImage: data.aboutPage.spotlightImage || prev.spotlightImage
          }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center overflow-hidden bg-primary text-on-primary">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            alt="Craftsmanship background"
            className="w-full h-full object-cover"
            src={getImgUrl(settings.banner)}
          />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter py-xxl text-center">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-md">{settings.title}</h1>
          <p className="font-body-lg text-body-lg max-w-2xl mx-auto opacity-90">
            {settings.description}
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl items-center">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-md tracking-wider">The Mission</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-lg tracking-tight">{settings.missionTitle}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-md">
              {settings.missionDescription1}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {settings.missionDescription2}
            </p>
          </div>
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
            <img 
              alt="Sustainable design" 
              className="w-full h-full object-cover"
              src={getImgUrl(settings.missionImage)} 
            />
          </div>
        </div>
      </section>

      {/* Values - Compact & Viewport Optimized */}
      <section className="bg-white py-xl md:py-xxl">
        <div className="w-full max-w-container-max mx-auto px-gutter flex flex-col gap-lg md:gap-xl">
          <div className="text-center">
            <span className="font-label-caps text-label-caps text-secondary tracking-[0.3em] block mb-xs text-[10px]">THE FOUNDATION</span>
            <h2 className="font-display-md text-display-lg-mobile text-primary">Our Core Values</h2>
            <div className="w-16 h-1 bg-[#081F5C] mx-auto mt-md rounded-full opacity-30"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md md:gap-lg">
            {[
              { 
                title: 'Unique', 
                desc: 'Every bag is a one-of-a-kind statement, crafted from history.',
                icon: 'auto_awesome',
                bg: 'bg-[#081F5C]',
                text: 'text-white'
              },
              { 
                title: 'Transparent', 
                desc: 'Full visibility into our sustainable and ethical production.',
                icon: 'visibility',
                bg: 'bg-surface-container-high',
                text: 'text-primary'
              },
              { 
                title: 'Connected', 
                desc: 'Bridging past memories and future style via recycled denim.',
                icon: 'hub',
                bg: 'bg-secondary',
                text: 'text-white'
              }
            ].map((val, i) => (
              <div key={val.title} className={`${val.bg} ${val.text} p-lg rounded-[1.5rem] flex flex-col gap-md shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                <div className={`w-12 h-12 rounded-xl ${val.text === 'text-white' ? 'bg-white/10' : 'bg-primary/10'} backdrop-blur-md flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[24px]">{val.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl mb-xs uppercase tracking-wide">{val.title}</h3>
                  <p className="font-body-md opacity-80 leading-snug text-xs">{val.desc}</p>
                </div>
                <div className="mt-auto opacity-10 font-display-md text-2xl text-right">0{i+1}</div>
              </div>
            ))}
          </div>

          {/* Memory Bags Feature Card - Compact */}
          <div className="bg-[#081F5C]/5 border-l-4 border-[#081F5C] rounded-2xl p-lg md:p-xl flex flex-col md:flex-row items-center gap-lg relative">
            <div className="md:w-1/4 text-center md:text-left">
              <span className="text-secondary font-label-caps text-[10px] tracking-[0.2em] mb-xs inline-block">PHILOSOPHY</span>
              <h3 className="font-display-md text-3xl text-primary italic">“Memory Bags”</h3>
            </div>
            <div className="md:w-3/4 md:border-l border-outline-variant/30 md:pl-lg">
              <p className="font-body-lg text-base md:text-lg text-on-surface leading-relaxed">
                LOOM is built on these three core values. We create pieces that <span className="text-primary font-bold">preserve the stories, emotions, and personal memories</span> of each customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Material Spotlight */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl">
        <div className="bg-primary text-on-primary rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-xl md:p-xxl flex flex-col justify-center">
            <span className="font-label-caps text-label-caps text-secondary-container mb-md">The Materials</span>
            <h2 className="font-display-md text-display-md mb-lg">{settings.spotlightTitle}</h2>
            <p className="font-body-lg text-body-lg opacity-90 mb-xl leading-relaxed">
              {settings.spotlightDescription}
            </p>
            <div className="flex gap-lg">
              <div className="flex flex-col">
                <span className="font-headline-lg text-headline-lg">90%</span>
                <span className="font-label-caps text-label-caps opacity-70">Water Saved</span>
              </div>
              <div className="w-px h-12 bg-on-primary opacity-20"></div>
              <div className="flex flex-col">
                <span className="font-headline-lg text-headline-lg">100%</span>
                <span className="font-label-caps text-label-caps opacity-70">Recycled Content</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 min-h-[400px]">
            <img 
              alt="Close up of recycled denim" 
              className="w-full h-full object-cover"
              src={getImgUrl(settings.spotlightImage)} 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl text-center">
        <h2 className="font-display-md text-display-md text-primary mb-xl">Join the Conscious Movement</h2>
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link to="/collection" className="bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:opacity-90 transition-opacity">
            Explore Collection
          </Link>
          <Link to="/products" className="border border-primary text-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-surface-container transition-colors">
            Shop All Bags
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
