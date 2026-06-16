import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { categories } from '../utils/constants';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);

  const toggleCategory = (index) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
  };

  return (
    <>
      {/* Top Bar (Scrolls away) */}
     <div className="hidden md:flex w-full bg-primary text-white text-xs py-2 px-4 md:px-8 lg:px-12 justify-between items-center font-sans">
        <div>
          <span className="tracking-wide text-[12px] text-white">Free Shipping Over ₹500</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/track-order" className="hidden sm:block hover:text-gray-300 transition-colors tracking-wide">Track your order</Link>
          <span className="hidden sm:block w-px h-3 bg-gray-400 opacity-50"></span>
          <Link to="/support" className="hover:text-gray-300 transition-colors tracking-wide">Need support?</Link>
          <div className="flex items-center space-x-3 pl-2">
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaFacebookF size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaXTwitter size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaYoutube size={14} /></a>
            <a href="#" className="hover:text-gray-300 transition-transform hover:scale-110"><FaInstagram size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar (Sticky) */}
      <header className="w-full bg-white px-4 md:px-8 lg:px-12 py-0 flex justify-between items-center sticky top-0 z-[100] border-b border-gray-200 font-sans shadow-sm">
        
        <div className="flex items-center">
          {/* Hamburger Menu Icon (Mobile Only) */}
          <button 
            className="lg:hidden mr-3 text-gray-700 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="P2J Mart Logo" 
              className="h-16 md:h-23 w-auto object-contain py-1"
            />
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 font-medium hover:text-secondary transition-colors">Home</Link>
          <Link to="/products" className="text-gray-700 font-medium hover:text-secondary transition-colors">Products</Link>
          <Link to="/customized" className="text-gray-700 font-medium hover:text-secondary transition-colors">Customized Products</Link>
          <Link to="/contact" className="text-gray-700 font-medium hover:text-secondary transition-colors">Contact Us</Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Search Bar (Desktop) */}
          <div className="relative hidden lg:block group">
            <input 
              type="text" 
              placeholder="Search Product..." 
              className="w-72 border border-gray-300 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary p-1 rounded-full hover:bg-gray-50 transition-colors">
              <Search size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Search Icon (Mobile) */}
          <button className="lg:hidden text-gray-700 hover:text-primary">
            <Search size={22} strokeWidth={2} />
          </button>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-5 text-primary">
            
            <button className="hover:text-secondary transition-colors hover:scale-110 transform relative">
              <Heart size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-secondary text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border border-white">0</span>
            </button>
            <button className="hover:text-secondary transition-colors hover:scale-110 transform relative">
              <ShoppingBag size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border border-white">0</span>
            </button>
            <button className="hover:text-secondary transition-colors hover:scale-110 transform">
              <User size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out">
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-16 object-contain"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 border-b border-gray-100 flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg hover:text-primary transition-colors">Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg hover:text-primary transition-colors">Products</Link>
              <Link to="/customized" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg hover:text-primary transition-colors">Customized Products</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium text-lg hover:text-primary transition-colors">Contact Us</Link>
            </div>

            {/* Categories Accordion */}
            <div className="p-4">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Categories</h3>
              <ul className="flex flex-col space-y-1">
                {categories.map((cat, idx) => (
                  <li key={idx} className="border-b border-gray-50 last:border-0 pb-1">
                    <button 
                      onClick={() => toggleCategory(idx)}
                      className="w-full flex justify-between items-center py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                    >
                      <span>{cat.name}</span>
                      {openCategoryIndex === idx ? (
                        <ChevronUp size={18} className="text-primary" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </button>
                    
                    {/* Subcategories Dropdown */}
                    {openCategoryIndex === idx && (
                      <ul className="pl-4 py-2 space-y-3 bg-gray-50/80 rounded-md mt-1 mb-2 border-l-2 border-primary/30">
                        {cat.subcategories.map((sub, i) => (
                          <li key={i}>
                            <Link 
                              to="#" 
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-gray-600 text-sm hover:text-primary transition-colors block"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
        

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
