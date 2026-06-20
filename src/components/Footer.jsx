import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Headset, ChevronUp } from 'lucide-react';
import { FaInstagram, FaYoutube, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaCcVisa, FaCcAmex, FaCcMastercard, FaCcPaypal, FaCcDiscover } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = () => {
    scrollToTop();
  };

  return (
    <footer className="bg-primary font-sans text-white">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-12 pb-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* ABOUT */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-4 text-[14px]">ABOUT</h4>
            <ul className="space-y-2 text-white">
              <li><Link to="/contact" onClick={handleLinkClick} className="text-[13px]">Contact Us</Link></li>
              <li><Link to="/cart" onClick={handleLinkClick} className="text-[13px]">Cart</Link></li>
              <li><Link to="/wishlist" onClick={handleLinkClick} className="text-[13px]">Wishlist</Link></li>
              <li><Link to="/returns-policy" onClick={handleLinkClick} className="text-[13px]">Cancellation &amp; Returns</Link></li>
            </ul>
          </div>

          {/* CONSUMER POLICY */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-4 text-[14px]">CONSUMER POLICY</h4>
            <ul className="space-y-2 text-white">
              <li><Link to="/terms" onClick={handleLinkClick} className="text-[13px]">Terms and Condition</Link></li>
              <li><Link to="/privacy-policy" onClick={handleLinkClick} className="text-[13px]">Privacy Policy</Link></li>
              <li><Link to="/shipping" onClick={handleLinkClick} className="text-[13px]">Delivery and Shipping</Link></li>
              <li><Link to="/returns-policy" onClick={handleLinkClick} className="text-[13px]">Cancellation &amp; Returns</Link></li>
            </ul>
          </div>

          {/* Address */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-4 text-[14px]">Address</h4>
            <p className="text-[13px] text-white leading-relaxed mb-4">
              25, Vembuliamman koil street, west k.k. nagar ,<br/>
              chennai 78
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-white"><FaInstagram size={16} /></a>
              <a href="#" className="text-white"><FaXTwitter size={16} /></a>
              <a href="#" className="text-white"><FaYoutube size={16} /></a>
              <a href="#" className="text-white"><FaFacebookF size={16} /></a>
            </div>
          </div>

          {/* Registered Office */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-4 text-[14px]">Registered Office Address:</h4>
            <div className="leading-relaxed mb-4 space-y-1">
              <p className="text-[13px] text-white m-0">Buildings Alyssa, Begonia &amp; Clove Embassy Tech</p>
              <p className="text-[13px] text-white m-0">Village,</p>
              <p className="text-[13px] text-white m-0">Outer Ring Road, Devarabeesanahalli Village,</p>
              <p className="text-[13px] text-white m-0">Bengaluru, 560103, Karnataka, India</p>
              <p className="text-[13px] text-white m-0">CIN: U51109KA2012PTC066107</p>
              <p className="text-[13px] text-white m-0">Telephone: 123-456-7890</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <img src={`${import.meta.env.BASE_URL}payment_logos/visa.png`} alt="Visa" className="h-8 w-12 object-cover rounded bg-white" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/amex.png`} alt="Amex" className="h-8 w-12 object-cover rounded bg-white" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/mastercard.png`} alt="Mastercard" className="h-8 w-12 object-cover rounded bg-white" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/paypal.png`} alt="PayPal" className="h-8 w-12 object-cover rounded bg-white" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/discover.png`} alt="Discover" className="h-8 w-12 object-cover rounded bg-white" />
            </div>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-gray-500/60 my-8" />

        {/* Middle Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-2">
          <div>
            <Truck size={32} className="text-[#1890ff] mb-3" strokeWidth={2} />
            <h5 className="text-white font-bold mb-2 text-[14px]">Free Delivery</h5>
            <p className="text-[13px] text-white leading-relaxed">
              Phasellus blandit massa enim elit, of passage<br/>varius nunc.
            </p>
          </div>
          <div>
            <RotateCcw size={32} className="text-[#1890ff] mb-3" strokeWidth={2} />
            <h5 className="text-white font-bold mb-2 text-[14px]">30 Day Returns Guarantee</h5>
            <p className="text-[13px] text-white leading-relaxed">
              Phasellus blandit massa enim elit, of passage<br/>varius nunc.
            </p>
          </div>
          <div>
            <Headset size={32} className="text-[#1890ff] mb-3" strokeWidth={2} />
            <h5 className="text-white font-bold mb-2 text-[14px]">24/7 Online Support</h5>
            <p className="text-[13px] text-white leading-relaxed">
              Phasellus blandit massa enim elit, of passage<br/>varius nunc.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0B1521] py-4 px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center relative">
        <p className="font-semibold text-white m-0 text-[12px]">@P2JMart All Rights Reserved {new Date().getFullYear()}</p>
        <a href="https://jayamwebsolutions.com/web-design-company-in-chennai.php" target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-0 md:mr-10 text-white m-0 text-[12px] hover:text-secondary hover:underline transition-all">Developed by Jayam Web Solutions</a>
        
        {/* Scroll to top button exactly on the right edge */}
        <button 
          onClick={scrollToTop}
          className="absolute right-0 top-0 h-full w-12 bg-black text-white flex items-center justify-center hover:bg-gray-900 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
