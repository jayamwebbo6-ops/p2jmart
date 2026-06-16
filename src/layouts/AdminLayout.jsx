import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-primary';
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col z-10">
        <div className="p-4 border-b flex items-center justify-center h-20">
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="P2J Mart Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin" className={`block p-3 rounded font-medium transition-colors ${isActive('/admin')}`}>Dashboard</Link>
          <Link to="/admin/products" className={`block p-3 rounded font-medium transition-colors ${isActive('/admin/products') || location.pathname.includes('/admin/products/')} `}>Products</Link>
          <Link to="/admin/orders" className={`block p-3 rounded font-medium transition-colors ${isActive('/admin/orders')}`}>Orders</Link>
          <Link to="/admin/users" className={`block p-3 rounded font-medium transition-colors ${isActive('/admin/users')}`}>Users</Link>
          <Link to="/admin/settings" className={`block p-3 rounded font-medium transition-colors ${isActive('/admin/settings')}`}>Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-20 px-8 flex justify-between items-center z-0">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-secondary hover:underline px-4 py-2 border border-secondary rounded hover:bg-secondary hover:text-white transition-colors">
              View Store
            </Link>
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
