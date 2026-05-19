import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      q: "Are the bags made from real recycled denim?",
      a: "Yes! Every LOOM bag is crafted from pre-loved denim garments and textile waste that we source and carefully clean before production."
    },
    {
      q: "How do I care for my LOOM bag?",
      a: "We recommend hand washing with mild detergent or spot cleaning. Avoid harsh chemicals and do not tumble dry to preserve the integrity of the recycled fibers."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we primarily ship within Vietnam. Please contact us via email for international shipping inquiries."
    },
    {
      q: "Can I return a product?",
      a: "Yes, we accept returns within 7 days of delivery for products in their original condition. Please see our Return Policy for more details."
    }
  ];

  return (
    <div className="pt-xxl pb-xxl px-gutter max-w-container-max mx-auto">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xl">Frequently Asked Questions</h1>
      <div className="max-w-3xl flex flex-col gap-xl">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-outline-variant pb-md">
            <h3 className="font-headline-md text-on-surface mb-sm">{faq.q}</h3>
            <p className="font-body-md text-on-surface-variant">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
