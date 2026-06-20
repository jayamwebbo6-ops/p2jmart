import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Gauge, 
  Package, 
  Tag, 
  ShoppingBag, 
  Truck, 
  Mail, 
  Percent, 
  Users, 
  User, 
  LogOut,
  XCircle,
  Layers
} from 'lucide-react';

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
      ? 'bg-primary text-white font-bold shadow-md shadow-slate-950/15' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-primary font-semibold';
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden admin-panel">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col z-10 shadow-[6px_0_25px_-5px_rgba(0,0,0,0.04),_4px_0_10px_-2px_rgba(0,0,0,0.02)]">
        <div className="p-4 flex items-center justify-center h-20">
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="P2J Mart Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <Link to="/admin/homecms" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/homecms')}`}>
            <LayoutGrid size={18} className="flex-shrink-0" />
            <span className="text-sm">Home CMS</span>
          </Link>
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
            <Gauge size={18} className="flex-shrink-0" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/products') || location.pathname.includes('/admin/products/')} `}>
            <Package size={18} className="flex-shrink-0" />
            <span className="text-sm">Products</span>
          </Link>
          <Link to="/admin/attributes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/attributes')}`}>
            <Tag size={18} className="flex-shrink-0" />
            <span className="text-sm">Attributes</span>
          </Link>
          <Link to="/admin/combo-pack" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/combo-pack')}`}>
            <Layers size={18} className="flex-shrink-0" />
            <span className="text-sm">Combo Pack</span>
          </Link>
          <Link to="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/orders')}`}>
            <ShoppingBag size={18} className="flex-shrink-0" />
            <span className="text-sm">Orders</span>
          </Link>
          <Link to="/admin/cancel-requests" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/cancel-requests')}`}>
            <XCircle size={18} className="flex-shrink-0" />
            <span className="text-sm">Cancel Requests (Buyer)</span>
          </Link>
          <Link to="/admin/shippingCost" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/shippingCost')}`}>
            <Truck size={18} className="flex-shrink-0" />
            <span className="text-sm">Shipping Cost</span>
          </Link>
          <Link to="/admin/enquiries" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive('/admin/enquiries')}`}>
            <div className="flex items-center gap-3">
              <Mail size={18} className="flex-shrink-0" />
              <span className="text-sm">Enquiries</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-5">
                {unreadCount}
              </span>
            )}
          </Link>
          
          <Link to="/admin/gst" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/gst')}`}>
            <Percent size={18} className="flex-shrink-0" />
            <span className="text-sm">GST</span>
          </Link>
 
          <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/users')}`}>
            <Users size={18} className="flex-shrink-0" />
            <span className="text-sm">Customers</span>
          </Link>
          <Link to="/admin/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/profile')}`}>
            <User size={18} className="flex-shrink-0" />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>
      </aside>
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-20 px-4 flex justify-between items-center z-0">
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
                  <span className="text-xs text-slate-500">Administrator</span>
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
                    <User size={16} className="text-gray-400" />
                    <span>View Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
