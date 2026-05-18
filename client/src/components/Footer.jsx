import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-low dark:bg-inverse-surface mt-xxl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-xl px-gutter py-xxl w-full max-w-container-max mx-auto">
        <div className="col-span-1">
          <div className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mb-md">LOOM</div>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">© 2024 LOOM. Sustainable by Choice.</p>
        </div>
        <div className="col-span-1 md:col-span-3 flex flex-wrap gap-lg justify-start md:justify-end">
          <Link to="#" className="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors focus:underline decoration-primary dark:decoration-primary-fixed underline-offset-4">Contact</Link>
          <Link to="#" className="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors focus:underline decoration-primary dark:decoration-primary-fixed underline-offset-4">Shipping & Returns</Link>
          <Link to="#" className="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors focus:underline decoration-primary dark:decoration-primary-fixed underline-offset-4">Privacy Policy</Link>
          <Link to="#" className="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors focus:underline decoration-primary dark:decoration-primary-fixed underline-offset-4">Sustainability</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
