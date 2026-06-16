import React from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag 
} from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <>
      {/* Top Bar (Scrolls away) */}
      <div className="w-full bg-primary text-white text-xs py-2 px-4 md:px-8 lg:px-12 flex justify-between items-center font-sans">
        <div>
          <span className="tracking-wide text-[12px] text-white">Free Shipping Over ₹500</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/track-order" className="hover:text-gray-300 transition-colors tracking-wide">Track your order</Link>
          <span className="w-px h-3 bg-gray-400 opacity-50"></span>
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
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="P2J Mart Logo" 
            className="h-16 md:h-20 w-auto object-contain py-1"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 font-medium hover:text-secondary transition-colors">Home</Link>
          <Link to="/products" className="text-gray-700 font-medium hover:text-secondary transition-colors">Products</Link>
          <Link to="/customized" className="text-gray-700 font-medium hover:text-secondary transition-colors">Customized Products</Link>
          <Link to="/contact" className="text-gray-700 font-medium hover:text-secondary transition-colors">Contact Us</Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
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

          {/* Action Icons */}
          <div className="flex items-center space-x-5 text-primary">
            <button className="hover:text-secondary transition-colors hover:scale-110 transform">
              <User size={24} strokeWidth={1.5} />
            </button>
            <button className="hover:text-secondary transition-colors hover:scale-110 transform relative">
              <Heart size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-secondary text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border border-white">0</span>
            </button>
            <button className="hover:text-secondary transition-colors hover:scale-110 transform relative">
              <ShoppingBag size={24} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border border-white">0</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
