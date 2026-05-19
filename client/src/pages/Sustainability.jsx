import React from 'react';

const Sustainability = () => {
  return (
    <div className="pt-xxl pb-xxl px-gutter max-w-container-max mx-auto">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xl">Sustainability</h1>
      <div className="prose prose-lg max-w-3xl">
        <p className="font-body-lg text-on-surface-variant mb-md">
          At LOOM, sustainability isn't just a buzzword; it's the core of everything we do. 
          We believe that fashion should be beautiful, functional, and responsible.
        </p>
        <h2 className="font-headline-md text-on-surface mt-xl mb-md">Our Recycled Denim</h2>
        <p className="font-body-md text-on-surface-variant mb-md">
          Every bag we create starts its life as something else—typically a pair of vintage jeans or industrial denim waste. 
          By upcycling these materials, we reduce the demand for new water, energy, and chemicals required to produce virgin denim.
        </p>
        <h2 className="font-headline-md text-on-surface mt-xl mb-md">Zero Waste Mission</h2>
        <p className="font-body-md text-on-surface-variant mb-md">
          We strive to use every scrap of fabric. Small offcuts are transformed into patches, inner pockets, or decorative elements, 
          ensuring that our production process leaves behind as little waste as possible.
        </p>
      </div>
    </div>
  );
};

export default Sustainability;
