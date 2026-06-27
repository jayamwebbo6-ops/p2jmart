import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import { toast, ToastContainer } from './components/toast';
import { isUserAuthenticated } from './api/userApi';
import { fetchCart, addCartItem, updateCartItem, removeCartItem, clearCart, clearCartState } from './redux/cartSlice';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AccountLayout from './layouts/AccountLayout';
import GSTSettingsPage from './pages/admin/GstSettingsPage';
import TermsContion from './pages/user/TermsConditions';
import ProductReviews from './pages/admin/ProductReviews';

// Lazy loading user pages
const Home = lazy(() => import('./pages/user/Home'));
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
const CancelRequests = lazy(() => import('./pages/admin/CancelRequests'));
const ComboPack = lazy(() => import('./pages/admin/ComboPack'));

// Lazy loading subcategory page
const Subcategory = lazy(() => import('./pages/user/Subcategory'));
const HomeContentManager = lazy(() => import('./pages/admin/HomeCMS/HomeContentManager'));

function App() {
  const basename = import.meta.env.BASE_URL;
  
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items || []);

  const [localCart, setLocalCart] = useState(cart);

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  /* ==========================================================================
      LOAD AUTHENTICATED USER CART
     ========================================================================== */
  useEffect(() => {
    if (isUserAuthenticated()) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  useEffect(() => {
    const onLoginStateChange = () => {
      if (isUserAuthenticated()) {
        dispatch(fetchCart());
      } else {
        dispatch(clearCartState());
      }
    };

    window.addEventListener('userLoginStateChange', onLoginStateChange);
    return () => window.removeEventListener('userLoginStateChange', onLoginStateChange);
  }, [dispatch]);

  /* ==========================================================================
      GLOBAL WISHLIST STATE MANAGEMENT
     ========================================================================== */
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("user_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("user_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item.id === product.id)) {
      setWishlist([...wishlist, product]);
      toast.success(`"${product.title || 'Product'}" added to Wishlist!`);
    } else {
      toast.info(`"${product.title || 'Product'}" is already in your Wishlist.`);
    }
  };

  const removeFromWishlist = (productId) => {
    const item = wishlist.find((item) => item.id === productId);
    setWishlist(wishlist.filter((item) => item.id !== productId));
    if (item) {
      toast.info(`"${item.title}" removed from Wishlist.`);
    }
  };

  /* ==========================================================================
      CORE CART OPERATIONAL HANDLERS
     ========================================================================== */
  const addToCart = async (product) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before adding items to cart.');
      return;
    }

    const productId = product.id || product._id || product.productId;
    const payload = {
      productId,
      title: product.title || product.name || 'Product',
      price: Number(product.price ?? 0),
      quantity: product.quantity || 1,
      image: product.image || (product.images && product.images[0]) || '',
      selectedOptions: product.selectedOptions || {},
      isComboProduct: Boolean(product.isComboProduct),
      includedProducts: product.includedProducts || []
    };

    try {
      await dispatch(addCartItem(payload)).unwrap();
      toast.success(`"${payload.title}" added to Cart!`);
    } catch (error) {
      toast.error(error || 'Unable to add product to cart.');
    }
  };

  const updateQuantity = (id, amount) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    const existingItem = cart.find((item) => item.id === id || item._id === id);
    if (!existingItem) return;

    const nextQty = Math.max(1, (existingItem.quantity || 1) + amount);
    dispatch(updateCartItem({ itemId: existingItem.id || existingItem._id, payload: { quantity: nextQty } }));
  };

  const removeFromCart = (id) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    if (!id) return;
    dispatch(removeCartItem(id));
  };

  const clearCartItems = async () => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    try {
      await dispatch(clearCart()).unwrap();
      toast.success('All cart items have been removed.');
    } catch (error) {
      toast.error(error || 'Unable to clear cart.');
    }
  };

  return (
    <BrowserRouter basename={basename}>
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
            
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/products/:id/reviews" element={<ProductReviews />} />
            <Route path="terms" element={<TermsContion/>} />
            <Route path="cancellation-return-policy" element={<CancellationReturnPolicy />} />

            {/* FIXED: Modified component properties targeting to accept global items and safe setter references */}
            <Route 
              path="cart" 
              element={
                <Cart 
                  cart={localCart} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                  clearCart={clearCartItems}
                  setCart={setLocalCart}
                />
              } 
            />
            <Route 
              path="checkout" 
              element={
                <Checkout 
                  cart={localCart} 
                  setCart={setLocalCart}
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
            <Route path="cancel-requests" element={<CancelRequests />} />

            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="gst" element={<GSTSettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;