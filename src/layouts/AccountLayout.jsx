import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, ShoppingCart, LogOut, Home, ChevronDown, Settings } from 'lucide-react';

const AccountLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/my-account/profile', label: 'Profile', icon: <User size={18} /> },
    { to: '/my-account/orders', label: 'Orders', icon: <Package size={18} /> },
    { to: '/my-account/address', label: 'Address Book', icon: <MapPin size={18} /> },
    { to: '/wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { to: '/cart', label: 'Cart', icon: <ShoppingCart size={18} /> },
    { to: '/my-account/logout', label: 'Logout', icon: <LogOut size={18} /> }
  ];

  // Derive current page for title parsing and mobile header selection
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPagePath = pathParts[pathParts.length - 1];
  const currentPage = (currentPagePath === 'my-account' ? 'profile' : currentPagePath) || 'profile';
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ');

  // Find active item properties to display inside mobile wrapper button
  const currentActiveLink = navLinks.find(link => {
    if (currentPage === 'profile' && link.label === 'Profile') return true;
    return link.to.endsWith(currentPage);
  }) || navLinks[0];

  // Auto-collapse mobile option listing menu when changing navigation paths
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#fcf9f5] font-sans py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary transition-colors flex items-center">
            <Home size={14} className="mr-1" />
          </Link>
          <span>/</span>
          <Link to="/my-account" className="hover:text-primary transition-colors">My Account</Link>
          <span>/</span>
          <span className="font-bold text-black">{pageTitle}</span>
        </div>
        
        {/* Conditional Search & Filter for Orders Page */}
        {currentPage === 'orders' && (
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 bg-white"
            />
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer">
              <option>All Orders</option>
              <option>Delivered</option>
              <option>Processing</option>
              <option>Cancelled</option>
            </select>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col min-[825px]:flex-row gap-6">
        
        {/* Responsive Sidebar Container */}
        <div className="w-full min-[825px]:w-64 flex-shrink-0 relative">
          
          {/* MOBILE TOGGLE HEADER VIEW: Displayed only below 825px width */}
          <div className="min-[825px]:hidden bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between p-4 font-medium text-gray-800 transition-colors bg-white hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex items-center space-x-3 text-primary">
                {currentActiveLink.icon}
                <span className="font-semibold text-gray-900">{currentActiveLink.label}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <Settings size={16} className="animate-spin-slow" />
                <ChevronDown size={18} className={`transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180 text-primary' : ''}`} />
              </div>
            </button>
          </div>

          {/* SIDEBAR NAVIGATION: Blocks as list normally above 825px, or expands as dynamic overlay tray beneath 825px */}
          <div className={`
            w-full bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out
            max-[824px]:absolute max-[824px]:top-full max-[824px]:left-0 max-[824px]:z-40 max-[824px]:mt-2 max-[824px]:border max-[824px]:border-gray-100 max-[824px]:shadow-xl
            ${isMobileMenuOpen ? 'max-[824px]:opacity-100 max-[824px]:visible max-[824px]:translate-y-0' : 'max-[824px]:opacity-0 max-[824px]:invisible max-[824px]:-translate-y-2 min-[825px]:block'}
          `}>
            {/* Desktop Brand Heading Box (Hidden completely on mobile layouts) */}
            <div className="hidden min-[825px]:block bg-primary text-white p-5">
              <h2 className="text-xl font-bold tracking-wide text-white">My Account</h2>
            </div>

            <nav className="flex flex-col py-2">
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) => {
                    const isActuallyActive = isActive || (link.label === 'Profile' && (location.pathname === '/my-account' || location.pathname === '/my-account/'));

                    if (link.label === 'Logout') {
                      return 'flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 text-red-500 hover:text-white hover:bg-red-500 border-l-4 border-l-transparent';
                    }
                    return `flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                      isActuallyActive
                        ? 'text-primary border-l-4 border-l-primary bg-primary/5'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/5 border-l-4 border-l-transparent'
                    }`;
                  }}
                >
                  <span className="opacity-80">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-50">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AccountLayout;