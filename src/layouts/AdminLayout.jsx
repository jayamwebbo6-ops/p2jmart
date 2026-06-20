import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaUser, 
  FaSignOutAlt, 
  FaTags, 
  FaEnvelope, 
  FaPercent // Added for GST / Tax
} from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [adminData, setAdminData] = useState({
    username: 'Admin User',
    photo: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('p2j_admin_profile');
      if (stored) {
        setAdminData(JSON.parse(stored));
      }
    };
    loadData();

    window.addEventListener('adminProfileUpdate', loadData);
    return () => window.removeEventListener('adminProfileUpdate', loadData);
  }, []);

  useEffect(() => {
    const updateUnreadCount = () => {
      const saved = localStorage.getItem('p2j_mart_enquiries');
      if (saved) {
        const list = JSON.parse(saved);
        const unread = list.filter(e => !e.read);
        setUnreadCount(unread.length);
      } else {
        setUnreadCount(0);
      }
    };
    
    updateUnreadCount();
    window.addEventListener('enquiriesUpdated', updateUnreadCount);
    return () => window.removeEventListener('enquiriesUpdated', updateUnreadCount);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [adminData.photo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    const current = location.pathname.replace(/\/$/, '') || '/admin';
    const target = path.replace(/\/$/, '');
    
    const isMatched = target === '/admin' 
      ? (current === '/admin') 
      : current.startsWith(target);
      
    return isMatched 
      ? 'bg-primary text-white font-bold shadow-md shadow-primary/10' 
      : 'text-[#003147] hover:bg-gray-100 hover:text-[#003147] font-medium';
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-54 bg-white shadow-md flex flex-col z-10">
        <div className="p-4 border-b flex items-center justify-center h-20">
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="P2J Mart Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin/homeCMS" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/homecms')}`}>
            <FaTachometerAlt className="w-5 h-5 flex-shrink-0" />
            <span>Home CMS</span>
          </Link>
          <Link to="/admin" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin')}`}>
            <FaTachometerAlt className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/products') || location.pathname.includes('/admin/products/')} `}>
            <FaBox className="w-5 h-5 flex-shrink-0" />
            <span>Products</span>
          </Link>
          <Link to="/admin/attributes" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/attributes')}`}>
            <FaTags className="w-5 h-5 flex-shrink-0" />
            <span>Attributes</span>
          </Link>
          <Link to="/admin/orders" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/orders')}`}>
            <FaShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span>Orders</span>
          </Link>
          <Link to="/admin/shippingCost" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/orders')}`}>
            <FaShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span>Shipping Cost</span>
          </Link>
          <Link to="/admin/enquiries" className={`flex items-center justify-between p-3 rounded font-medium transition-colors ${isActive('/admin/enquiries')}`}>
            <div className="flex items-center gap-3">
              <FaEnvelope className="w-5 h-5 flex-shrink-0" />
              <span>Enquiries</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-5">
                {unreadCount}
              </span>
            )}
          </Link>
          
          <Link to="/admin/gst" className={`flex items-center justify-between p-3 rounded font-medium transition-colors ${isActive('/admin/gst')}`}>
  <div className="flex items-center gap-3">
    <FaPercent className="w-4 h-4 flex-shrink-0" />
    <span>GST</span>
  </div>
</Link>

          <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/users')}`}>
            <FaUsers className="w-5 h-5 flex-shrink-0" />
            <span>Customers</span>
          </Link>
          <Link to="/admin/profile" className={`flex items-center gap-3 p-3 rounded font-medium transition-colors ${isActive('/admin/profile')}`}>
            <FaUser className="w-5 h-5 flex-shrink-0" />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-20 px-8 flex justify-between items-center z-0">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex items-center space-x-4">
          

            {/* User Profile Dropdown */}
            <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none hover:opacity-80 transition-opacity"
              >
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-gray-800">{adminData.username || 'Admin User'}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                {imgError || !adminData.photo ? (
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm text-sm border border-gray-200">
                    {adminData.username ? adminData.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                ) : (
                  <img 
                    src={adminData.photo} 
                    alt="Admin" 
                    onError={() => setImgError(true)}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-slideIn">
                  <Link 
                    to="/admin/profile" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="w-4 h-4 text-gray-400" />
                    <span>View Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"
                  >
                    <FaSignOutAlt className="w-4 h-4 text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
