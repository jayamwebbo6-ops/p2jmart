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
  FileText,
  XCircle,
  Ticket,
  Layers,
  RefreshCw,
  Menu,
  Bell
} from 'lucide-react';

import { isAdminAuthenticated, adminLogout } from '../api/adminApi';
import { getEnqueriesAPI } from '../api/enqueriesApi';
import { getProductsAPI } from '../api/productApi';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Check if the user is authenticated (token exists in cookie)
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }

    const loadData = () => {
      const stored = localStorage.getItem('p2j_admin_profile');
      if (stored) {
        setAdminData(JSON.parse(stored));
      }
    };
    loadData();

    window.addEventListener('adminProfileUpdate', loadData);
    return () => window.removeEventListener('adminProfileUpdate', loadData);
  }, [navigate]);

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

    const fetchInitialEnquiries = async () => {
      if (isAdminAuthenticated()) {
        try {
          const res = await getEnqueriesAPI();
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map(item => ({
              ...item,
              id: item._id || item.id
            }));
            localStorage.setItem('p2j_mart_enquiries', JSON.stringify(mapped));
            updateUnreadCount();
          }
        } catch (err) {
          console.error("Error fetching initial enquiries for badge:", err);
        }
      }
    };
    
    updateUnreadCount();
    fetchInitialEnquiries();
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

  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchLowStockCount = async () => {
    if (!isAdminAuthenticated()) return;
    try {
      const threshold = (() => {
        const saved = localStorage.getItem('p2j_mart_threshold');
        return saved ? parseInt(saved, 10) : 5;
      })();
      
      const res = await getProductsAPI({ includeInactive: 'true' });
      if (res && res.success && Array.isArray(res.data)) {
        let count = 0;
        res.data.forEach(prod => {
          const hasVariants = prod.variants && prod.variants.length > 0;
          if (hasVariants) {
            prod.variants.forEach(v => {
              if ((Number(v.stock) || 0) <= threshold) {
                count++;
              }
            });
          } else {
            const stockVal = prod.stock !== undefined ? Number(prod.stock) : 10;
            if (stockVal <= threshold) {
              count++;
            }
          }
        });
        setLowStockCount(count);
      }
    } catch (err) {
      console.error("Error fetching products for low stock alert badge:", err);
    }
  };

  useEffect(() => {
    fetchLowStockCount();
    const interval = setInterval(fetchLowStockCount, 15000);
    window.addEventListener('stockRestocked', fetchLowStockCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('stockRestocked', fetchLowStockCount);
    };
  }, [location.pathname]);

  const handleBellClick = () => {
    navigate('/admin?tab=low-stock');
  };

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
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden admin-panel">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white flex flex-col z-50 shadow-[6px_0_25px_-5px_rgba(0,0,0,0.04),_4px_0_10px_-2px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-center h-20">
          <Link to="/" onClick={() => setIsSidebarOpen(false)}>
            <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="P2J Mart Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <Link to="/admin/homecms" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/homecms')}`}>
            <LayoutGrid size={18} className="flex-shrink-0" />
            <span className="text-sm">Home CMS</span>
          </Link>
          <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
            <Gauge size={18} className="flex-shrink-0" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/admin/products" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/products') || location.pathname.includes('/admin/products/')} `}>
            <Package size={18} className="flex-shrink-0" />
            <span className="text-sm">Products</span>
          </Link>
          <Link to="/admin/attributes" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/attributes')}`}>
            <Tag size={18} className="flex-shrink-0" />
            <span className="text-sm">Attributes</span>
          </Link>
           <Link to="/admin/admin-coupons" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/admin-coupons')}`}>
            <Ticket size={18} className="flex-shrink-0" />
            <span className="text-sm">Coupons</span>
          </Link>
          <Link to="/admin/combo-pack" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/combo-pack')}`}>
            <Layers size={18} className="flex-shrink-0" />
            <span className="text-sm">Combo Pack</span>
          </Link>
          <Link to="/admin/orders" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/orders')}`}>
            <ShoppingBag size={18} className="flex-shrink-0" />
            <span className="text-sm">Orders</span>
          </Link>
          <Link to="/admin/return-requests" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/return-requests')}`}>
            <RefreshCw size={18} className="flex-shrink-0" />
            <span className="text-sm">Return Requests (Buyer)</span>
          </Link>
          <Link to="/admin/shippingCost" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/shippingCost')}`}>
            <Truck size={18} className="flex-shrink-0" />
            <span className="text-sm">Shipping Cost</span>
          </Link>
          <Link to="/admin/enquiries" onClick={() => setIsSidebarOpen(false)} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive('/admin/enquiries')}`}>
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
          
          <Link to="/admin/gst" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/gst')}`}>
            <Percent size={18} className="flex-shrink-0" />
            <span className="text-sm">GST</span>
          </Link>

           <Link to="/admin/sales-report" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/sales-report')}`}>
            <FileText size={18} className="flex-shrink-0" />
            <span className="text-sm">Sales Report</span>
          </Link>
 
          <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/users')}`}>
            <Users size={18} className="flex-shrink-0" />
            <span className="text-sm">Customers</span>
          </Link>
          <Link to="/admin/profile" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/profile')}`}>
            <User size={18} className="flex-shrink-0" />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>
      </aside>
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-20 px-4 flex justify-between items-center z-30 relative shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell Icon */}
            <button
              onClick={handleBellClick}
              className="relative p-2 text-gray-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
              title="Low Stock Alert Center"
            >
              <Bell size={20} className={lowStockCount > 0 ? "text-amber-500 animate-pulse" : ""} />
              {lowStockCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {lowStockCount}
                </span>
              )}
            </button>

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
