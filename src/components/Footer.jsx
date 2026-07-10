import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Headset, ChevronUp } from 'lucide-react';
import { FaInstagram, FaYoutube, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { getHomeCMS } from '../api/homeCms'; 

const Footer = () => {
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterCMS = async () => {
      try {
        setIsLoading(true);
        const res = await getHomeCMS();
        
        if (res && res.data && res.data.contactSetting) {
          setContactData(res.data.contactSetting);
        } else if (res && res.contactSetting) {
          setContactData(res.contactSetting);
        } else if (res && !Array.isArray(res) && typeof res === 'object') {
          setContactData(res);
        } else {
          console.warn("Unexpected data payload structure for Footer contact settings.");
        }
      } catch (err) {
        console.error("Error fetching Footer contact schema:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchFooterCMS();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary font-sans text-white w-full overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-8">
        
        {/* Top Section Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
          
          {/* GROUP 1: ABOUT & CONSUMER POLICY (Side-by-side 2 divs on mobile, removes extra space) */}
          <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 text-center md:text-left">
            {/* ABOUT */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div>
                <h4 className="text-white font-bold mb-4 text-[14px] tracking-wider">ABOUT</h4>
                <ul className="space-y-2 text-white p-0 list-none">
                  <li><Link to="/contact" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Contact Us</Link></li>
                  <li><Link to="/cart" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Cart</Link></li>
                  <li><Link to="/wishlist" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Wishlist</Link></li>
                </ul>
              </div>
            </div>

            {/* CONSUMER POLICY */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div>
                <h4 className="text-white font-bold mb-4 text-[14px] tracking-wider">CONSUMER POLICY</h4>
                <ul className="space-y-2 text-white p-0 list-none">
                  <li><Link to="/terms" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Terms and Condition</Link></li>
                  <li><Link to="/privacy-policy" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/delivery-policy" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Delivery and Shipping</Link></li>
                  <li><Link to="/cancellation-return-policy" onClick={scrollToTop} className="text-[13px] hover:text-gray-300 transition-colors">Cancellation &amp; Returns</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* GROUP 2: ADDRESSES (Shows 1 by 1 in center below 768px/640px) */}
          {/* DYNAMIC SHOP ADDRESS BLOCK */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start col-span-1">
            <h4 className="text-white font-bold mb-4 text-[14px] tracking-wider">ADDRESS</h4>
            
            {isLoading ? (
              <p className="text-[13px] text-gray-400 animate-pulse">Loading address data...</p>
            ) : contactData ? (
              <div className="w-full flex flex-col items-center md:items-start">
                <p className="text-[13px] text-white leading-relaxed mb-4 break-words max-w-xs text-center md:text-left">
                  {contactData.address}
                </p>
                <div className="flex space-x-4 justify-center md:justify-start">
                  {contactData.instagram && contactData.instagram.trim() !== '' && (
                    <a href={contactData.instagram} target="_blank" rel="noopener noreferrer" className="text-white transition-transform hover:scale-110">
                      <FaInstagram size={16} />
                    </a>
                  )}
                  {contactData.twitter && contactData.twitter.trim() !== '' && (
                    <a href={contactData.twitter} target="_blank" rel="noopener noreferrer" className="text-white transition-transform hover:scale-110">
                      <FaXTwitter size={16} />
                    </a>
                  )}
                  {contactData.youtube && contactData.youtube.trim() !== '' && (
                    <a href={contactData.youtube} target="_blank" rel="noopener noreferrer" className="text-white transition-transform hover:scale-110">
                      <FaYoutube size={16} />
                    </a>
                  )}
                  {contactData.facebook && contactData.facebook.trim() !== '' && (
                    <a href={contactData.facebook} target="_blank" rel="noopener noreferrer" className="text-white transition-transform hover:scale-110">
                      <FaFacebookF size={16} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-gray-400">Address info currently unavailable.</p>
            )}
          </div>

          {/* REGISTERED OFFICE */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start col-span-1">
            <h4 className="text-white font-bold mb-4 text-[14px] tracking-wider">REGISTERED OFFICE ADDRESS</h4>
            <div className="leading-relaxed mb-4 space-y-1 text-white max-w-xs text-center md:text-left">
              <p className="m-0 text-[13px] text-white">Buildings Alyssa, Begonia &amp; Clove Embassy Tech Village,</p>
              <p className="m-0 text-[13px] text-white">Outer Ring Road, Devarabeesanahalli Village,</p>
              <p className="m-0 text-[13px] text-white">Bengaluru, 560103, Karnataka, India</p>
              <p className="m-0 text-[13px] text-white">CIN: U51109KA2012PTC066107</p>
              <p className="m-0 text-[13px] text-white font-medium mt-1">
                Telephone: {contactData?.phones ? contactData.phones.split(',')[0] : "123-456-7890"}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
              <img src={`${import.meta.env.BASE_URL}payment_logos/visa.jpg`} alt="Visa" className="h-6 w-9 object-contain rounded bg-white p-0.5" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/amex.jpg`} alt="Amex" className="h-6 w-9 object-contain rounded bg-white p-0.5" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/mastercard.jpg`} alt="Mastercard" className="h-6 w-9 object-contain rounded bg-white p-0.5" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/paypal.jpg`} alt="PayPal" className="h-6 w-9 object-contain rounded bg-white p-0.5" />
              <img src={`${import.meta.env.BASE_URL}payment_logos/discover.jpg`} alt="Discover" className="h-6 w-9 object-contain rounded bg-white p-0.5" />
            </div>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-gray-500/40 my-8" />

        {/* Middle Section: Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <Truck size={32} className="text-[#1890ff] mb-3" strokeWidth={1.5} />
            <h5 className="text-white font-bold mb-1 text-[14px]">Free Delivery</h5>
            <p className="text-[13px] text-gray-200 leading-relaxed max-w-xs">
              Phasellus blandit massa enim elit, of passage varius nunc.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <RotateCcw size={32} className="text-[#1890ff] mb-3" strokeWidth={1.5} />
            <h5 className="text-white font-bold mb-1 text-[14px]">30 Day Returns Guarantee</h5>
            <p className="text-[13px] text-gray-200 leading-relaxed max-w-xs">
              Phasellus blandit massa enim elit, of passage varius nunc.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start sm:col-span-2 md:col-span-1">
            <Headset size={32} className="text-[#1890ff] mb-3" strokeWidth={1.5} />
            <h5 className="text-white font-bold mb-1 text-[14px]">24/7 Online Support</h5>
            <p className="text-[13px] text-gray-200 leading-relaxed max-w-xs">
              Phasellus blandit massa enim elit, of passage varius nunc.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0B1521] py-4 px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 relative pr-16">
        <p className="font-semibold text-white m-0 text-[12px] text-center md:text-left">
          © {new Date().getFullYear()} P2JMart. All Rights Reserved
        </p>
        <a 
          href="https://jayamwebsolutions.com/web-design-company-in-chennai.php" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white m-0 text-[12px] hover:text-blue-400 hover:underline transition-all text-center md:mr-6"
        >
          Developed by Jayam Web Solutions
        </a>
        
        <button 
          onClick={scrollToTop}
          className="absolute right-0 top-0 bottom-0 w-12 bg-black text-white flex items-center justify-center hover:bg-gray-900 transition-colors h-full"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;