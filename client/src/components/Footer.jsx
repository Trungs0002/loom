import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';
import { getImgUrl } from '../pages/AdminCategories';

const Footer = () => {
  const [logo, setLogo] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then(r => r.json())
      .then(data => setLogo(data.headerLogo))
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-surface-container-low mt-xxl border-t border-outline-variant/30">
      <div className="px-gutter py-xl md:py-xxl w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">

          {/* Brand Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center mb-sm hover:opacity-80 transition-opacity h-8">
              {logo ? (
                <img src={getImgUrl(logo)} alt="Loom" className="h-full w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-sm">
                  <img src="/avatar.png" alt="Loom" className="w-8 h-8 rounded-full object-cover" />
                  <div className="font-headline-lg text-headline-lg text-[#081F5C] tracking-widest">LOOM</div>
                </div>
              )}
            </Link>
            <p className="font-label-caps text-label-caps text-on-surface mb-md">Crafted from the past, designed for the future.</p>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              LOOM transforms old denim and fashion waste into modern recycled bags, giving used materials a new life through sustainable design.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-md">Quick Links</h4>
            <div className="flex flex-col gap-sm">
              <Link to="/" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Home</Link>
              <Link to="/collection" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Collections</Link>
              <Link to="/about" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">About LOOM</Link>
              <Link to="/sustainability" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Sustainability</Link>
              <Link to="/contact" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Contact</Link>
              <Link to="/faq" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>

          {/* Customer Support */}
          <div className="col-span-1">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-md">Customer Support</h4>
            <div className="flex flex-col gap-sm">
              <Link to="/shipping-policy" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Shipping Policy</Link>
              <Link to="/return-policy" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Return & Exchange Policy</Link>
              <Link to="/care-instructions" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Care Instructions</Link>
              <Link to="/size-guide" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Size Guide</Link>
              <Link to="/payment-methods" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Payment Methods</Link>
            </div>
          </div>

          {/* Contact & Sustainability */}
          <div className="col-span-1 flex flex-col gap-xl">
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-md">Contact</h4>
              <div className="flex flex-col gap-xs font-body-md text-body-md text-on-surface-variant">
                <p>Email: <a href="mailto:work.loomdenim@gmail.com" className="hover:text-primary transition-colors">work.loomdenim@gmail.com</a></p>
                <p>Hotline: <a href="tel:0981456397" className="hover:text-primary transition-colors">0981456397</a></p>
              </div>
            </div>

            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Sustainability</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Every LOOM bag is crafted from recycled denim, helping reduce fashion waste while creating stylish, functional pieces for everyday use.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-xl pt-lg border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-body-md text-body-md text-on-surface-variant">© 2026 LOOM. All rights reserved.</p>

          <div className="flex items-center gap-md">
            <span className="font-label-caps text-label-caps text-on-surface">Follow Us:</span>
            <div className="flex gap-md">
              <a href="https://www.instagram.com/loom__bags" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Instagram</a>
              <a href="https://www.tiktok.com/@loom.bags" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">TikTok</a>
              <a href="https://web.facebook.com/people/LOOM-BAGS/61589634698432/" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Facebook</a>
              <a href="https://www.linkedin.com/company/loom-bags/" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">LinkedIn</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
