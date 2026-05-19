import React from 'react';

const PolicyPage = ({ title, content }) => {
  return (
    <div className="pt-xxl pb-xxl px-gutter max-w-container-max mx-auto">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xl">{title}</h1>
      <div className="prose prose-lg max-w-3xl font-body-md text-on-surface-variant space-y-md">
        {content.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicy = () => (
  <PolicyPage 
    title="Shipping Policy" 
    content={[
      "We process orders within 1-2 business days.",
      "Delivery within Ho Chi Minh City usually takes 1-3 days.",
      "National shipping across Vietnam typically takes 3-5 business days.",
      "Shipping costs are calculated at checkout based on your location."
    ]} 
  />
);

export const ReturnPolicy = () => (
  <PolicyPage 
    title="Return & Exchange Policy" 
    content={[
      "Items can be returned or exchanged within 7 days of receipt.",
      "The product must be unused, in its original packaging, and with all tags attached.",
      "Return shipping costs are the responsibility of the customer unless the item arrived damaged.",
      "Refunds will be processed once we receive and inspect the returned item."
    ]} 
  />
);

export const CareInstructions = () => (
  <PolicyPage 
    title="Care Instructions" 
    content={[
      "Hand wash cold with mild detergent.",
      "Do not bleach.",
      "Lay flat to dry in the shade.",
      "Iron on low heat if necessary.",
      "Denim may bleed slightly during the first few washes, so wash separately."
    ]} 
  />
);

export const SizeGuide = () => (
  <PolicyPage 
    title="Size Guide" 
    content={[
      "All our bags have dimensions listed on their individual product pages.",
      "Small: Ideal for essentials (phone, wallet, keys).",
      "Medium: Fits a tablet, small book, and daily items.",
      "Large: Suitable for a 13\" laptop and more.",
      "Please refer to the specific 'Dimensions' section on each product page for exact measurements."
    ]} 
  />
);

export const PaymentMethods = () => (
  <PolicyPage 
    title="Payment Methods" 
    content={[
      "Cash on Delivery (COD) - available nationwide in Vietnam.",
      "Bank Transfer.",
      "E-wallets (Momo, ZaloPay) - coming soon.",
      "Credit/Debit cards - coming soon."
    ]} 
  />
);
