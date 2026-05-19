import React from 'react';

const Contact = () => {
  return (
    <div className="pt-xxl pb-xxl px-gutter max-w-container-max mx-auto">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xl">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl">
        <div>
          <h2 className="font-headline-md text-on-surface mb-md">Get in Touch</h2>
          <p className="font-body-md text-on-surface-variant mb-xl">
            Have questions about our products or your order? We're here to help.
          </p>

          <div className="flex flex-col gap-lg">
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-xs">Email</h3>
              <p className="font-body-lg text-on-surface">work.loomdenim@gmail.com</p>
            </div>
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-xs">Phone</h3>
              <p className="font-body-lg text-on-surface">0981 456 397</p>
            </div>
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-xs">Studio</h3>
              <p className="font-body-lg text-on-surface">Ha Noi City, Vietnam</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container p-xl rounded-xl">
          <h2 className="font-headline-md text-on-surface mb-md">Send a Message</h2>
          <form className="flex flex-col gap-md">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Name</label>
              <input type="text" className="w-full p-md bg-surface border border-outline-variant rounded-DEFAULT focus:outline-none focus:border-primary" placeholder="Your name" />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Email</label>
              <input type="email" className="w-full p-md bg-surface border border-outline-variant rounded-DEFAULT focus:outline-none focus:border-primary" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Message</label>
              <textarea className="w-full p-md bg-surface border border-outline-variant rounded-DEFAULT focus:outline-none focus:border-primary h-32" placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="bg-primary text-on-primary py-md px-xl font-label-caps hover:bg-primary-container transition-colors rounded-DEFAULT">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
