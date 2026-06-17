import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/user/Home';
import UserProducts from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import AccountLayout from './layouts/AccountLayout';
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import OrderDetails from './pages/user/OrderDetails';
import AddressBook from './pages/user/AddressBook';
import Wishlist from './pages/user/Wishlist';
import Cart from './pages/user/Cart';

import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import AdminOrders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';

function App() {
  // Vite automatically exposes the configured base URL here
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* User Facing Store Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<UserProducts />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          
          {/* Account Routes */}
          <Route path="my-account" element={<AccountLayout />}>
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="address" element={<AddressBook />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
          </Route>
          
          {/* Order Details Route (Without Sidebar) */}
          <Route path="my-account/order/:id" element={<OrderDetails />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
