import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AccountLayout from './layouts/AccountLayout';

// Lazy loading user pages
const Home = lazy(() => import('./pages/user/Home'));
const UserProducts = lazy(() => import('./pages/user/Products'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Orders = lazy(() => import('./pages/user/Orders'));
const OrderDetails = lazy(() => import('./pages/user/OrderDetails'));
const AddressBook = lazy(() => import('./pages/user/AddressBook'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const Cart = lazy(() => import('./pages/user/Cart'));
const ContactPage = lazy(() => import('./pages/user/ContactPage'));

// Lazy loading admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

// Lazy loading subcategory page
const Subcategory = lazy(() => import('./pages/user/Subcategory'));

function App() {
  const basename = import.meta.env.BASE_URL;
  const [cart, setCart] = useState([]);

  /* ==========================================================================
      GLOBAL WISHLIST STATE MANAGEMENT
     ========================================================================== */
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("user_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Automatically update localStorage whenever the wishlist array changes
  useEffect(() => {
    localStorage.setItem("user_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item.id === product.id)) {
      setWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter((item) => item.id !== productId));
  };

  /* ==========================================================================
      GLOBAL CART STATE MANAGEMENT
     ========================================================================== */
  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      alert("The product was already in cart");
      return;
    }
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <BrowserRouter basename={basename}>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* User Facing Store Routes */}
          <Route path="/" element={<UserLayout wishlist={wishlist} cart={cart} />}>
            
            {/* 1. FIXED: Added onAddToCart prop to Home component */}
            <Route 
              index 
              element={
                <Home 
                  wishlist={wishlist} 
                  addToWishlist={addToWishlist} 
                  removeFromWishlist={removeFromWishlist} 
                  onAddToCart={addToCart} 
                />
              } 
            />
            
            <Route path="products" element={<UserProducts />} />
            <Route path="product/:id" element={<ProductDetail />} />
            
            {/* 2. FIXED: Linked data arrays and event handlers directly into Cart component */}
            <Route 
              path="cart" 
              element={
                <Cart 
                  cart={cart} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                />
              } 
            />
            
            <Route path="contact" element={<ContactPage />} />
            
            <Route 
              path="wishlist" 
              element={
                <Wishlist 
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />

            
            
            <Route 
              path="subCategory" 
              element={
                <Subcategory 
                  wishlist={wishlist}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />

            {/* Account Routes */}
            <Route path="my-account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="address" element={<AddressBook />} />
            </Route>

            <Route path="my-account/order/:id" element={<OrderDetails />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;