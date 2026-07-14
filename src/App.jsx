import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import { ToastContainer, toast } from './components/toast';
import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import { applyCouponAPI } from './api/couponApi';

// Layouts
import UserLayout from './layouts/UserLayout';

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AccountLayout = lazy(() => import('./layouts/AccountLayout'));
const GSTSettingsPage = lazy(() => import('./pages/admin/GstSettingsPage'));
const TermsContion = lazy(() => import('./pages/user/TermsConditions'));
const ProductReviews = lazy(() => import('./pages/admin/ProductReviews'));

// Eagerly loading main entry page
import Home from './pages/user/Home';
const UserProducts = lazy(() => import('./pages/user/Products'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Orders = lazy(() => import('./pages/user/Orders'));
const Coupons = lazy(() => import('./pages/user/Coupons'));
const OrderDetails = lazy(() => import('./pages/user/OrderDetails'));
const AddressBook = lazy(() => import('./pages/user/AddressBook'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const Cart = lazy(() => import('./pages/user/Cart'));
const Checkout = lazy(() => import('./pages/user/Checkout'));
const ContactPage = lazy(() => import('./pages/user/ContactPage'));
const CustomizedProduct = lazy(() => import('./pages/user/CustomizedProduct'));
const CustomizedProductDetails = lazy(() => import('./pages/user/CustomizedProductDetails'));
const ReturnPolicy = lazy(() => import('./pages/user/ReturnPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/user/PrivacyPolicy'));
const DeliveryPolicy = lazy(() => import('./pages/user/DelivaryPolicy'));
const CancellationReturnPolicy = lazy(() => import('./pages/user/CancellationReturnPolicy'));

const UserLogin = lazy(() => import('./pages/user/Login'));
const CompleteProfile = lazy(() => import('./pages/user/CompleteProfile'));

// Lazy loading admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminAttributes = lazy(() => import('./pages/admin/Attributes'));
const AdminEnquiries = lazy(() => import('./pages/admin/Enquiries'));
const ShippingCostPage = lazy(() => import('./pages/admin/ShippingCostManager'));
const ComboPack = lazy(() => import('./pages/admin/ComboPack'));
const ReturnRequests = lazy(() => import('./pages/admin/ReturnRequests'));
const SalesAnalytics = lazy(() => import('./pages/admin/Salesanalytics'));


// Lazy loading subcategory page
const Subcategory = lazy(() => import('./pages/user/Subcategory'));
const HomeContentManager = lazy(() => import('./pages/admin/HomeCMS/HomeContentManager'));

function App() {
  const basename = import.meta.env.BASE_URL;

  const {
    localCart,
    setLocalCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartItems
  } = useCart();

  const {
    wishlist,
    addToWishlist,
    removeFromWishlist
  } = useWishlist();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (subtotal, codeOverride) => {
    const code = (codeOverride ?? couponCode ?? '').trim().toUpperCase();

    if (!code) {
      toast.error('Please enter a coupon code.');
      return false;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await applyCouponAPI({ code, subtotal });
      if (res && res.success) {
        setAppliedCoupon(res.data);
        setCouponDiscount(Number(res.data.discountAmount || 0));
        setCouponCode(code);
        toast.success(res.message || 'Coupon applied successfully!');
        return true;
      }

      throw new Error(res?.message || 'Invalid or expired coupon code.');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid or expired coupon code.';
      setCouponError(errMsg);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      toast.error(errMsg);
      return false;
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
    toast.info('Coupon removed.');
  };

  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* User Facing Store Routes */}
          <Route path="/" element={<UserLayout wishlist={wishlist} cart={localCart} />}>
            
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
            
            {/* FIXED: Passed core wishlist and add-to-cart state hooks inside detail paths */}
            <Route 
              path="product/:id" 
              element={
                <ProductDetail 
                  onAddToCart={addToCart} 
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />
            <Route 
              path="sub-category/:subcategoryId/:id" 
              element={
                <ProductDetail 
                  onAddToCart={addToCart} 
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />
            <Route 
              path="subcategory/:subcategoryId/:id" 
              element={
                <ProductDetail 
                  onAddToCart={addToCart} 
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />
            
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/products/:id/reviews" element={<ProductReviews />} />
            <Route path="terms" element={<TermsContion/>} />
            <Route path="cancellation-return-policy" element={<CancellationReturnPolicy />} />

            <Route 
              path="cart" 
              element={
                <Cart 
                  cart={localCart} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                  clearCart={clearCartItems}
                  setCart={setLocalCart}
                  onAddToCart={addToCart}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  appliedCoupon={appliedCoupon}
                  couponDiscount={couponDiscount}
                  couponError={couponError}
                  applyingCoupon={applyingCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />
              } 
            />
            <Route 
              path="checkout" 
              element={
                <Checkout 
                  cart={localCart} 
                  setCart={setLocalCart}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  appliedCoupon={appliedCoupon}
                  couponDiscount={couponDiscount}
                  couponError={couponError}
                  applyingCoupon={applyingCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />
              } 
            />            
            <Route path="contact" element={<ContactPage />} />
            <Route path="customized" element={<CustomizedProduct />} />
            <Route path="login" element={<UserLogin />} />
            
            <Route 
              path="customizedProductDetail/:productId" 
              element={
                <CustomizedProductDetails 
                  onAddToCart={addToCart} 
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              } 
            />

            <Route path="delivery-policy" element={<DeliveryPolicy />} />
            <Route path="returns-policy" element={<ReturnPolicy />} />
            
            <Route 
              path="wishlist" 
              element={
                <Wishlist 
                  wishlist={wishlist}
                  removeFromWishlist={removeFromWishlist}
                  addToCart={addToCart}
                />
              } 
            />






            <Route 
              path="sub-category" 
              element={
                <Subcategory 
                  wishlist={wishlist}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                  onAddToCart={addToCart}
                />
              } 
            />
            <Route 
              path="subcategory" 
              element={
                <Subcategory 
                  wishlist={wishlist}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                  onAddToCart={addToCart}
                />
              } 
            />
            <Route 
              path="sub-category/:subcategoryId" 
              element={
                <Subcategory 
                  wishlist={wishlist}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                  onAddToCart={addToCart}
                />
              } 
            />
            <Route 
              path="subcategory/:subcategoryId" 
              element={
                <Subcategory 
                  wishlist={wishlist}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                  onAddToCart={addToCart}
                />
              } 
            />

            {/* Account Routes */}
            <Route path="my-account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="coupons" element={<Coupons/>} />
              <Route path="orders" element={<Orders />} />
              <Route path="address" element={<AddressBook />} />
            </Route>

            <Route path="my-account/order/:id" element={<OrderDetails />} />
          </Route>

          {/* User Complete Profile Route */}
          <Route path="/complete-profile" element={<CompleteProfile />} />

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
            <Route path="homecms" element={<HomeContentManager />} />

            <Route path="shippingCost" element={<ShippingCostPage />} />
            <Route path="combo-pack" element={<ComboPack />} />
            <Route path="admin-coupons" element={<AdminCoupons/>} />
            <Route path="return-requests" element={<ReturnRequests />} />

            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="gst" element={<GSTSettingsPage />} />
            <Route path="sales-report" element={<SalesAnalytics />} />

          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;