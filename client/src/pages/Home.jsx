/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <img
            alt="Loom hero banner"
            className="w-full h-full object-cover object-center opacity-90"
            src="/cover.png"
          />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter py-xxl flex flex-col items-start justify-center">
          <div className="max-w-2xl bg-surface/80 backdrop-blur-sm p-xl rounded-xl border border-outline-variant/30">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-md">
              Recycled Bags, Refined For You
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-lg">
              Discover our collection of sustainably crafted handbags, where timeless luxury meets environmental responsibility. Effortless elegance for the conscious modern woman.
            </p>
            <Link to="/collection" className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors duration-300 shadow-sm hover:shadow-md">
              View Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Ethos Section - Crafted with Intention */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-xxl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl items-center">
          <div className="order-2 md:order-1">
            <img className="w-full h-auto rounded-xl object-cover aspect-[4/3] shadow-sm" alt="Materials" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaPYMaiQe0s4wgYylHTX3to9okdYtXdfgL5DEFpiNSIL6WJ2x3SkYnsnYGE_DUCbHaf9ejPgD1DL5kmDz5wCx9af7mJe18jcFDyxhkCPNeMfOeyZ1QDob6ODHDqvbsD9_tYaWRRgL8s9UgB47aSbivKhZlfC1501SaTaUCk3qbkcCWbzZ_pRqZnRtBW2utMKT-S25X3C3COHOG6ETOLiMu9m96bdQRQOfIIxA3ci5688YTOJhR9XveHYJpYxEcN3ukyfB57llzmpU" />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <span className="font-label-caps text-label-caps text-secondary mb-md">Sustainable by Choice</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">Crafted with Intention</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
              Every Loom bag is a testament to mindful creation. We source premium recycled materials to design pieces that endure shifting trends. Our minimalist approach ensures that your bag is not just an accessory, but a staple of your refined, conscious wardrobe.
            </p>
            <Link to="/about" className="inline-block border border-primary text-primary font-label-caps text-label-caps px-xl py-md rounded-full hover:bg-primary hover:text-on-primary transition-colors duration-300 self-start">
              Learn About Our Materials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
