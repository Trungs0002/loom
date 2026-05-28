import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { getImgUrl } from './AdminCategories';

const PolicyPage = ({ image, title }) => {
  return (
    <div className="pt-24 pb-xxl px-gutter max-w-container-max mx-auto">
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30">
        {image ? (
          <img src={getImgUrl(image)} alt={title} className="w-full h-auto object-contain" />
        ) : (
          <div className="aspect-video bg-surface-container flex items-center justify-center text-on-surface-variant opacity-50">
            No policy image uploaded.
          </div>
        )}
      </div>
    </div>
  );
};

export const ShippingPolicy = () => {
  const [image, setImage] = useState('');
  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => setImage(data.shippingPolicyImage))
      .catch(console.error);
  }, []);
  return <PolicyPage title="Shipping Policy" image={image} />;
};

export const ReturnPolicy = () => {
  const [image, setImage] = useState('');
  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => setImage(data.returnPolicyImage))
      .catch(console.error);
  }, []);
  return <PolicyPage title="Return & Exchange Policy" image={image} />;
};

export const CareInstructions = () => {
  const [image, setImage] = useState('');
  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => setImage(data.careInstructionsImage))
      .catch(console.error);
  }, []);
  return <PolicyPage title="Care Instructions" image={image} />;
};

// Keeping these as text for now or simple placeholders
const TextPolicyPage = ({ title, content }) => {
  return (
    <div className="pt-24 pb-xxl px-gutter max-w-container-max mx-auto">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xl">{title}</h1>
      <div className="prose prose-lg max-w-3xl font-body-md text-on-surface-variant space-y-md">
        {content.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </div>
  );
};

export const SizeGuide = () => (
  <TextPolicyPage 
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
  <TextPolicyPage 
    title="Payment Methods" 
    content={[
      "Cash on Delivery (COD) - available nationwide in Vietnam.",
      "Bank Transfer.",
      "E-wallets (Momo, ZaloPay) - coming soon.",
      "Credit/Debit cards - coming soon."
    ]} 
  />
);
