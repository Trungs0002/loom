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

      {/* Values */}
      <section className="bg-surface-container-low py-xxl">
        <div className="w-full max-w-container-max mx-auto px-gutter text-center">
          <div className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">Our Core Values</h2>
            <div className="w-16 h-px bg-primary mx-auto opacity-30"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-display-md text-display-lg-mobile md:text-display-md text-primary mb-lg tracking-tight">
              Unique – Transparent – Connected
            </h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              LOOM is built on these three core values. We create more than just accessories; we create <span className="text-primary font-bold italic">“Memory Bags”</span> that preserve the stories, emotions, and personal memories of each customer.
            </p>
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
