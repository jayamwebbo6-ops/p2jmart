import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useThrottledCallback from '../../hooks/useThrottledCallback';

import { useDispatch } from 'react-redux';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  X,
  Layers
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { toast } from '../../components/toast';
import { 
  getMyAddressesAPI, 
  createAddressAPI, 
  deleteAddressAPI 
} from '../../api/addressApi';
import { getAllShippingAPI } from '../../api/shippingApi';
import { getAllGstAPI } from '../../api/gstApi';
import { createOrderAPI, getOrderByIdAPI } from '../../api/orderApi';
import { createPaymentAPI } from '../../api/paymentApi';
import { applyCouponAPI } from '../../api/couponApi';
import { fetchCart } from '../../redux/cartSlice';
import { getHomeCMS } from '../../api/homeCms';
import { isUserAuthenticated } from '../../api/userApi';
import {getEligibleCouponsAPI} from '../../api/couponApi'

const Checkout = ({
  cart = [],
  setCart,
 
}) => {
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image+Available";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`;
  };
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const directPurchaseItems = location.state?.items || null;
  const directPurchaseBundle = location.state?.directPurchaseBundle || null;
  const isDirectPurchase = !!location.state?.directPurchase || !!directPurchaseBundle;
  const checkoutItems = isDirectPurchase && (directPurchaseBundle || directPurchaseItems)
    ? (directPurchaseBundle ? [directPurchaseBundle] : directPurchaseItems)
    : cart;

  // Step state: 1 = Address, 2 = Payment/Order Summary, 3 = Order Success
  const [step, setStep] = useState(1);
  
  // Simulated dynamic payment state
  const [paymentStage, setPaymentStage] = useState('idle');
  const [devSimulationUrls, setDevSimulationUrls] = useState(null);
  const [orderRef, setOrderRef] = useState('');

  // Addresses state from DB
  const [addresses, setAddresses] = useState([]);
  const [shippingStates, setShippingStates] = useState([]);
  const [gstSettings, setGstSettings] = useState([]);
  const [globalShippingRules, setGlobalShippingRules] = useState({
    freeShippingMinAmount: 1000,
    flatShippingCost: 50
  });
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(true);


  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    stateId: '',
    pincode: '',
    isDefault: false
  });

  // Saved placed order details for Success Screen
  const [placedOrder, setPlacedOrder] = useState(null);

  // Coupon System State
  const [localCouponCode, setLocalCouponCode] = useState('');
  const [localAppliedCoupon, setLocalAppliedCoupon] = useState(null);
  const [localCouponDiscount, setLocalCouponDiscount] = useState(0);
  const [localApplyingCoupon, setLocalApplyingCoupon] = useState(false);
  const [localCouponError, setLocalCouponError] = useState('');


  const couponCode = localCouponCode;
const setCouponCode = setLocalCouponCode;
const appliedCoupon = localAppliedCoupon;
const couponDiscount = localCouponDiscount;
const couponError = localCouponError;
const applyingCoupon = localApplyingCoupon;

  // Selected address object
  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  // Math Calculations
  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const shippingFee = (() => {
    if (!selectedAddress || checkoutItems.length === 0) return 0;

    const getWeight = (item) => {
      if (item.weight !== undefined && item.weight !== null) {
        const w = parseFloat(item.weight);
        if (!isNaN(w)) return w;
      }
      if (item.productId && typeof item.productId === 'object' && item.productId.weight !== undefined && item.productId.weight !== null) {
        const w = parseFloat(item.productId.weight);
        if (!isNaN(w)) return w;
      }
      return 0;
    };

    const getFreeShipping = (item) => {
      if (item.freeShipping !== undefined && item.freeShipping !== null) {
        return String(item.freeShipping).trim().toLowerCase() === 'yes';
      }
      if (item.productId && typeof item.productId === 'object' && item.productId.freeShipping !== undefined && item.productId.freeShipping !== null) {
        return String(item.productId.freeShipping).trim().toLowerCase() === 'yes';
      }
      return false;
    };

    // Check if any product has freeShipping === 'No' (or not 'Yes')
    const hasNonFreeShippingItem = checkoutItems.some(item => !getFreeShipping(item));

    if (hasNonFreeShippingItem) {
      // Calculate weight-based shipping only for non-free-shipping items
      const nonFreeItems = checkoutItems.filter(item => !getFreeShipping(item));

      const totalWeight = nonFreeItems.reduce((acc, item) => acc + (getWeight(item) * item.quantity), 0);
      
      const flatCost = Number(globalShippingRules.flatShippingCost) || 50;
      const rule = shippingStates.find(s => s.stateName.trim().toLowerCase() === selectedAddress.state.trim().toLowerCase());

      if (totalWeight === 0) {
        return rule ? (Number(rule.baseCost) || 0) : flatCost;
      }

      if (!rule) {
        return flatCost;
      }

      const baseCost = Number(rule.baseCost) || 0;
      const baseWeight = Number(rule.baseWeight) || 0;
      const additionalCost = Number(rule.additionalCost) || 0;
      const additionalWeight = Number(rule.additionalWeight) || 1; // prevent division by zero

      if (totalWeight <= baseWeight) {
        return baseCost;
      } else {
        const extraWeight = totalWeight - baseWeight;
        const extraUnits = Math.ceil(extraWeight / additionalWeight);
        return baseCost + (extraUnits * additionalCost);
      }
    } else {
      // All items in cart/checkout are free shipping!
      // Apply global threshold rules:
      const threshold = Number(globalShippingRules.freeShippingMinAmount) || 1000;
      const flatCost = Number(globalShippingRules.flatShippingCost) || 50;
      return subtotal >= threshold ? 0 : flatCost;
    }
  })();

  // Dynamic GST tax calculation
  const gstAmount = checkoutItems.reduce((acc, item) => {
    const catName = item.category || 'Catalog';
    const rule = gstSettings.find(g => g.productCategoryName.trim().toLowerCase() === catName.trim().toLowerCase());
    const rate = rule && rule.gstStatus === 'active' ? rule.percentage : 0;
    return acc + ((item.price * item.quantity) * (rate / 100));
  }, 0);

  const total = Math.max(0, subtotal - couponDiscount + gstAmount + shippingFee);

  const hasUnavailableItems = checkoutItems.some(item => {
    if (item.isComboProduct) return false;
    return item.isActiveProduct === false || (item.availableStock !== undefined && (item.availableStock === 0 || item.quantity > item.availableStock));
  });

  // Load addresses, shipping states, and GST configurations from database safely
  const loadCheckoutData = async () => {
    setLoading(true);
    
    // 1. Fetch Addresses
    try {
      const addressRes = await getMyAddressesAPI();
      if (addressRes && addressRes.success && Array.isArray(addressRes.data)) {
        setAddresses(addressRes.data);
        const defAddr = addressRes.data.find(a => a.isDefault);
        if (defAddr) {
          setSelectedAddressId(defAddr._id);
        } else if (addressRes.data.length > 0) {
          setSelectedAddressId(addressRes.data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load user addresses:", err);
      toast.error("Could not load your saved addresses.");
    }

    // 2. Fetch Shipping States (Critical for Add Address dropdown)
    try {
      const shippingRes = await getAllShippingAPI();
      if (shippingRes && shippingRes.success && Array.isArray(shippingRes.data)) {
        setShippingStates(shippingRes.data);
      }
    } catch (err) {
      console.error("Failed to load shipping states:", err);
      toast.error("Failed to load shipping states. State selection dropdown may be unavailable.");
    }

    // 3. Fetch GST tax settings
    try {
      const gstRes = await getAllGstAPI();
      if (gstRes && gstRes.success && Array.isArray(gstRes.data)) {
        setGstSettings(gstRes.data);
      }
    } catch (err) {
      console.error("Failed to load GST settings:", err);
    }

    // 4. Fetch Home CMS rules for shipping thresholds
    try {
      const cmsRes = await getHomeCMS();
      if (cmsRes && cmsRes.success && cmsRes.data) {
        setGlobalShippingRules({
          freeShippingMinAmount: cmsRes.data.freeShippingMinAmount !== undefined ? cmsRes.data.freeShippingMinAmount : 1000,
          flatShippingCost: cmsRes.data.flatShippingCost !== undefined ? cmsRes.data.flatShippingCost : 50
        });
      }
    } catch (err) {
      console.error("Failed to load CMS shipping rules:", err);
    }

    // 5. Fetch eligible coupons
    try {
      const couponRes = await getEligibleCouponsAPI();
      if (couponRes && couponRes.success && Array.isArray(couponRes.data)) {
        const activeOnly = couponRes.data.filter(c => c.status === 'Active');
        setAvailableCoupons(activeOnly);
      }
    } catch (err) {
      console.error("Failed to load eligible coupons:", err);
    }

    setLoading(false);
  };




 


  useEffect(() => {
    if (!isUserAuthenticated()) {
      toast.info('Please login to proceed to checkout.');
      navigate('/login', { state: { from: '/checkout', checkoutState: location.state } });
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const orderQueryId = queryParams.get('orderId');

    if (orderQueryId) {
      const fetchPlacedOrder = async () => {
        setLoading(true);
        try {
          const res = await getOrderByIdAPI(orderQueryId);
          if (res && res.success && res.data) {
            setPlacedOrder(res.data);
            setStep(3);
          } else {
            toast.error('Could not retrieve order details');
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to fetch order summary');
        } finally {
          setLoading(false);
        }
      };
      fetchPlacedOrder();
    } else {
      loadCheckoutData();
    }
  }, [navigate, location]);

  // Redirect if checkout items are empty and we are not in success step
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderQueryId = queryParams.get('orderId');
    if (orderQueryId) return;

    if (checkoutItems.length === 0 && step !== 3 && paymentStage === 'idle' && !loading) {
      navigate('/cart');
    }
  }, [checkoutItems, step, navigate, paymentStage, loading, location.search]);

 const handleApplyCoupon = async (e) => {
  if (e) e.preventDefault();
  const typedCode = (couponCode || '').trim();

  if (!typedCode) {
    toast.error('Please enter a coupon code.');
    return;
  }

  if (typeof onApplyCoupon === 'function') {
    await onApplyCoupon(subtotal, typedCode);
    return;
  }

  setLocalApplyingCoupon(true);
  setLocalCouponError('');
  try {
    const res = await applyCouponAPI({ code: typedCode.toUpperCase(), subtotal });
    if (res && res.success) {
      setLocalAppliedCoupon(res.data);
      setLocalCouponDiscount(Number(res.data.discountAmount || 0));
      setCouponCode(typedCode.toUpperCase());
      toast.success(res.message || 'Coupon applied successfully!');
    }
  } catch (err) {
    console.error(err);
    const errMsg = err.response?.data?.message || 'Invalid or expired coupon code.';
    setLocalCouponError(errMsg);
    toast.error(errMsg);
    setLocalAppliedCoupon(null);
    setLocalCouponDiscount(0);
  } finally {
    setLocalApplyingCoupon(false);
  }
};


  const handleRemoveCoupon = () => {
  setLocalAppliedCoupon(null);
  setLocalCouponDiscount(0);
  setCouponCode('');
  setLocalCouponError('');
  toast.info('Coupon removed.');
};


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStateChange = (e) => {
    const selectedStateId = e.target.value;
    const selectedStateObj = shippingStates.find(s => s._id === selectedStateId);
    setNewAddress(prev => ({
      ...prev,
      stateId: selectedStateId,
      state: selectedStateObj ? selectedStateObj.stateName : ''
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.streetAddress || !newAddress.city || !newAddress.state || !newAddress.stateId || !newAddress.pincode) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await createAddressAPI(newAddress);
      if (res && res.success) {
        toast.success(res.message || 'Address added successfully');
        setAddresses(prev => {
          if (res.data.isDefault) {
            return prev.map(a => ({ ...a, isDefault: false })).concat(res.data);
          }
          return [...prev, res.data];
        });
        setSelectedAddressId(res.data._id);
        setIsAddModalOpen(false);
        setNewAddress({
          fullName: '',
          phoneNumber: '',
          streetAddress: '',
          apartment: '',
          city: '',
          state: '',
          stateId: '',
          pincode: '',
          isDefault: false
        });
      } else {
        toast.error(res?.message || 'Failed to add address');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    setAddressToDelete(id);
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete) {
      setLoading(true);
      try {
        const res = await deleteAddressAPI(addressToDelete);
        if (res && res.success) {
          toast.success(res.message || 'Address deleted successfully');
          setAddresses(prev => prev.filter(addr => addr._id !== addressToDelete));
          if (selectedAddressId === addressToDelete) {
            const remaining = addresses.filter(addr => addr._id !== addressToDelete);
            if (remaining.length > 0) {
              setSelectedAddressId(remaining[0]._id);
            } else {
              setSelectedAddressId('');
            }
          }
        } else {
          toast.error(res?.message || 'Failed to delete address');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server error deleting address');
      } finally {
        setAddressToDelete(null);
        setLoading(false);
      }
    }
  };


  const handleQuickApplyCoupon = async (couponCodeValue) => {
    const couponObj = availableCoupons.find(c => c.code.toUpperCase() === couponCodeValue.toUpperCase());
    if (couponObj) {
      if (couponObj.isExhausted) {
        toast.error('You have already used this coupon code to its maximum limit.');
        return;
      }
      if (couponObj.status !== 'Active') {
        toast.error('This coupon is currently inactive.');
        return;
      }
    }

    setCouponCode(couponCodeValue);
    setLocalCouponError('');

    try {
      setLocalApplyingCoupon(true);

    const res = await applyCouponAPI({
      code: couponCodeValue.toUpperCase(),
      subtotal
    });

    if (res?.success) {
      setLocalAppliedCoupon(res.data);
      setLocalCouponDiscount(Number(res.data.discountAmount || 0));
      setCouponCode(couponCodeValue.toUpperCase());
      toast.success(res.message || 'Coupon applied successfully!');
    }
  } catch (err) {
    const errMsg = err.response?.data?.message || 'Invalid or expired coupon code.';
    setLocalCouponError(errMsg);
    toast.error(errMsg);
    setLocalAppliedCoupon(null);
    setLocalCouponDiscount(0);
  } finally {
    setLocalApplyingCoupon(false);
  }
};

  const handleUseSelectedAddress = useThrottledCallback(() => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }
    setStep(2);
  }, 1000);

  const handlePlaceOrder = useThrottledCallback(async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: checkoutItems.map(item => ({
          productId: item.productId || item.id || item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item.images && item.images[0]) || '',
          selectedOptions: item.customization 
            ? { ...item.selectedOptions, customization: item.customization }
            : (item.selectedOptions || {}),
          isComboProduct: !!item.isComboProduct,
          includedProducts: item.includedProducts || [],
          weight: item.weight || 0
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          streetAddress: selectedAddress.streetAddress,
          apartment: selectedAddress.apartment || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        subtotal: Number(subtotal),
        gst: Number(gstAmount),
        shippingFee: Number(shippingFee),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: Number(couponDiscount),
        total: Number(total),
        isDirectPurchase: isDirectPurchase
      };

      const res = await createPaymentAPI(orderPayload);
      if (res && res.success) {
        if (res.simulationUrl) {
          // If simulationUrl is provided (development mode), show localhost simulation options modal
          setDevSimulationUrls(res);
          setPaymentStage('sandbox_simulation');
        } else {
          // Live/production mode: immediately redirect to CCAvenue
          toast.info('Redirecting to CCAvenue Payment Gateway...');
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = res.paymentUrl;
          
          const encRequestInput = document.createElement('input');
          encRequestInput.type = 'hidden';
          encRequestInput.name = 'encRequest';
          encRequestInput.value = res.encRequest;
          form.appendChild(encRequestInput);
          
          const accessCodeInput = document.createElement('input');
          accessCodeInput.type = 'hidden';
          accessCodeInput.name = 'access_code';
          accessCodeInput.value = res.accessCode;
          form.appendChild(accessCodeInput);
          
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        toast.error(res.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error initializing payment');
    } finally {
      setLoading(false);
    }
  }, 1000);

  if (step === 3 && placedOrder) {
    const isPaid = placedOrder.paymentStatus === 'paid';
    return (
    
      <div className="w-full max-w-4xl mx-auto sm:py-10 px-3 sm:px-4 font-sans flex flex-col items-center select-none antialiased">
  <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl text-center flex flex-col items-center transition-all">
    
    {/* Animated Status Icon Wrapper */}
    {isPaid ? (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4 sm:mb-6 border-4 border-green-100 shadow-inner shrink-0">
        <Check size={32} strokeWidth={3} className="animate-bounce" />
      </div>
    ) : (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4 sm:mb-6 border-4 border-amber-100 shadow-inner shrink-0">
        <Clock size={32} strokeWidth={3} className="animate-pulse" />
      </div>
    )}
    
    {/* Headline Header */}
    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-primary leading-tight mb-2 px-1">
      {isPaid ? 'Order Placed Successfully!' : 'Payment Failed / Pending'}
    </h2>
    <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mb-6 sm:mb-8 px-2 leading-relaxed">
      {isPaid 
        ? 'Thank you for your purchase. We have received your order, and our team is preparing it for delivery.'
        : 'Your payment was not completed. The stock for your items has been temporarily reserved for 15 minutes. Please complete payment within this window, or the order will be cancelled automatically.'}
    </p>

    <hr className="w-full border-gray-100 mb-5 sm:mb-6" />

    {/* Order Details Breakdown Box Layer */}
    <div className="w-full text-left bg-gray-50/70 border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="font-extrabold text-primary text-base sm:text-lg mb-4 border-b border-gray-200/60 pb-2">
        Order Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="min-w-0">
          <p className="text-gray-400 font-medium">Order ID</p>
          <p className="font-bold text-gray-900 tracking-wide break-all mt-0.5">
            {placedOrder.orderId}
          </p>
        </div>
        
        <div>
          <p className="text-gray-400 font-medium">Date Placed</p>
          <p className="font-bold text-gray-900 mt-0.5">
            {new Date(placedOrder.placedDate || placedOrder.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="md:col-span-2 min-w-0">
          <p className="text-gray-400 font-medium">Shipping Address</p>
          <div className="font-semibold text-gray-800 mt-1 space-y-0.5">
            <p className="font-extrabold text-black capitalize text-xs sm:text-sm">{placedOrder.shippingAddress?.fullName}</p>
            <p className="text-gray-600 capitalize text-xs">{placedOrder.shippingAddress?.streetAddress}{placedOrder.shippingAddress?.apartment ? `, ${placedOrder.shippingAddress.apartment}` : ''}</p>
            <p className="text-gray-600 capitalize text-xs">{placedOrder.shippingAddress?.city}, {placedOrder.shippingAddress?.state} - {placedOrder.shippingAddress?.pincode}</p>
            <p className="text-gray-900 font-bold mt-1.5 text-xs">PH: {placedOrder.shippingAddress?.phoneNumber}</p>
          </div>
        </div>
        
        {/* Dynamic Amount Bar Line */}
        <div className="md:col-span-2 border-t border-gray-200/70 pt-4 mt-1 flex flex-row items-center justify-between gap-2 w-full">
          <div className="min-w-0">
            <p className="text-gray-400 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              {isPaid ? 'Total Paid' : 'Total Amount Due'}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400/90 font-medium truncate mt-0.5">
              {isPaid ? 'via Cash / Card / UPI' : 'Temporary Hold: 15 mins'}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary shrink-0 tracking-tight">
            ₹{placedOrder.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>

    {/* Primary Navigation Buttons Flow Control */}
    <div className="grid grid-cols-1 min-[411px]:flex min-[411px]:flex-row gap-2 w-full justify-center">
  <Link
    to="/"
    className="w-full min-[411px]:w-auto bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-center text-[11px] sm:text-xs flex items-center justify-center gap-1.5"
  >
    Continue Shopping
  </Link>

  <Link
    to="/my-account"
    className="w-full min-[411px]:w-auto border border-primary/30 hover:border-primary text-primary bg-transparent hover:bg-gray-50/50 font-semibold py-2 px-4 rounded-lg transition-all active:scale-[0.98] text-center text-[11px] sm:text-xs flex items-center justify-center gap-1.5"
  >
    View Order History
  </Link>
</div>
    
  </div>
</div>

    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 font-sans">
      
      {/* Steps Indicator Section */}
      <div className="flex items-center justify-center gap-4 my-8">
        <div className="flex items-center">
          {step === 1 ? (
            <div className="flex items-center bg-primary text-white px-5 py-2.5 rounded-full shadow-[0_4px_10px_rgba(0,49,71,0.2)] gap-2 font-bold text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-full bg-[#001f2e] flex items-center justify-center text-[10px] sm:text-xs">01</span>
              <span>Address</span>
            </div>
          ) : (
            <button 
              onClick={() => setStep(1)}
              className="flex items-center bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-full gap-2 font-bold text-xs sm:text-sm transition-all"
            >
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] sm:text-xs">
                <Check size={10} strokeWidth={4} />
              </span>
              <span>Address</span>
            </button>
          )}
        </div>

        <div className={`w-12 sm:w-16 h-[2px] ${step === 2 ? 'bg-primary' : 'bg-gray-300'} transition-all`}></div>

        <div className="flex items-center">
          {step === 2 ? (
            <div className="flex items-center bg-primary text-white px-5 py-2.5 rounded-full shadow-[0_4px_10px_rgba(0,49,71,0.2)] gap-2 font-bold text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-full bg-[#001f2e] flex items-center justify-center text-[10px] sm:text-xs">02</span>
              <span>Payment</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400 gap-2 font-medium text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] sm:text-xs">02</span>
              <span>Payment</span>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: ADDRESS SELECTION */}
      {step === 1 && (
        <div className="w-full bg-white border border-gray-100 shadow-xl rounded-3xl p-4 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center text-primary border border-blue-100 flex-shrink-0">
              <MapPin size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight leading-none">Shipping Address</h2>
              <span className="text-[11px] sm:text-xs text-gray-400 mt-1 block">Select or Add New Location</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Stored Locations</span>
            <div className="h-px bg-gray-100 w-full"></div>
          </div>

          {loading && addresses.length === 0 ? (
            <div className="flex flex-col gap-6 py-12 items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#002B49] rounded-full animate-spin"></div>
              <span className="text-xs font-semibold uppercase tracking-wider">Loading Addresses...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address._id;
                return (
                  <div 
                    key={address._id}
                    onClick={() => setSelectedAddressId(address._id)}
                    className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between bg-white relative cursor-pointer transition-all duration-300 select-none ${
                      isSelected 
                        ? 'border-primary border-2 shadow-[0_0_15px_rgba(0,49,71,0.06)]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5 flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>

                      <div className="text-left font-sans">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-tight mb-2 uppercase tracking-wide">
                          {address.fullName}
                        </h4>
                        <div className="text-[11px] sm:text-[13px] text-gray-500 space-y-1">
                          <p className="capitalize">{address.streetAddress}</p>
                          {address.apartment && <p>{address.apartment}</p>}
                          <p className="capitalize">{address.city}, {address.state} - {address.pincode}</p>
                          <p className="pt-2 text-black font-bold tracking-wide">PH: {address.phoneNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
                      <button
                        onClick={(e) => handleDeleteAddress(address._id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors bg-transparent border-0 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div 
                onClick={() => setIsAddModalOpen(true)}
                className="border-2 border-dashed border-gray-200 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-white cursor-pointer transition-all duration-300 min-h-[160px] group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50/50 group-hover:text-primary flex items-center justify-center text-gray-400 transition-colors mb-3">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors">Add New Address</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button 
              onClick={handleUseSelectedAddress}
              disabled={!selectedAddressId}
              className={`w-full max-w-md font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer text-sm sm:text-base ${
                selectedAddressId 
                  ? 'bg-primary hover:bg-secondary text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Use Selected Address</span>
              <ArrowLeft size={16} strokeWidth={2.5} className="rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT & ORDER SUMMARY */}
      {step === 2 && (
        <div className="w-full bg-white border border-gray-100 shadow-xl rounded-3xl p-4 sm:p-8 flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center text-primary border border-blue-100 flex-shrink-0">
              <ShoppingBag size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight leading-none">Order Summary</h2>
              <span className="text-[11px] sm:text-xs text-gray-400 mt-1 block">Please review your order details before payment</span>
            </div>
          </div>

          {selectedAddress && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="font-sans">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Delivering To</p>
                <p className="font-extrabold text-sm text-gray-800 capitalize leading-none mb-1">{selectedAddress.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedAddress.streetAddress}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs font-bold text-secondary hover:underline bg-transparent border-0 cursor-pointer"
              >
                Change Address
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {checkoutItems.map((item) => (
              <div 
                key={item.id || item._id} 
                className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0 gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Link 
                    to={item.isComboProduct && item.includedProducts?.[0]
                      ? `/product/${item.includedProducts[0].id || item.includedProducts[0]._id || item.includedProducts[0].productId}`
                      : `/product/${item.productId || item.id || item._id}`
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 relative block cursor-pointer"
                  >
                    <img 
                      src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image) || (item.images && item.images[0]))} 
                      alt={item.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" 
                    />
                    {item.isComboProduct ? (
                      <div className="absolute bottom-0 inset-x-0 bg-blue-900/90 text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-0.5">
                        <Layers size={8} /> Combo
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-black rounded-full border border-white"></div>
                    )}
                  </Link>
                  
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>
                    {item.isComboProduct ? (
                      <span className="inline-block mt-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                        ✨ Combo Bundle Savings Deal
                      </span>
                    ) : (
                      <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">
                        Joy Gift House / Default Variant
                      </p>
                    )}

                    {/* Nested Combo items listing */}
                    {item.isComboProduct && item.includedProducts && (
                      <div className="mt-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2 w-full max-w-full">
                        <p className="text-[8px] sm:text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                          Included Products:
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {item.includedProducts.map((subItem, index) => (
                            <div key={subItem.id || index} className="flex items-center gap-1.5 bg-white border border-slate-100 p-1 rounded">
                              <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200/85 overflow-hidden shrink-0">
                                <img 
                                  src={formatImageUrl(subItem.image)} 
                                  alt={subItem.productName || subItem.title} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <span className="truncate text-gray-800 text-[10px] font-semibold flex-1">
                                {subItem.productName || subItem.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-1">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                    {!item.isComboProduct && (item.isActiveProduct === false ? (
                      <span className="inline-block text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-1">
                        Currently Unavailable
                      </span>
                    ) : item.availableStock === 0 ? (
                      <span className="inline-block text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-1">
                        Out of Stock
                      </span>
                    ) : (item.availableStock !== undefined && item.quantity > item.availableStock) ? (
                      <span className="inline-block text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1">
                        Only {item.availableStock} units available
                      </span>
                    ) : null)}
                  </div>
                </div>
                
                <span className="text-xs sm:text-sm font-black text-gray-955 shrink-0 mt-1">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>




<div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight">
        Available Coupons
      </h4>
      <p className="text-[10px] text-gray-400 font-medium">
        Tap a coupon to apply it instantly
      </p>
    </div>
  </div>

  {loadingCoupons ? (
    <div className="text-xs text-gray-500 py-3">Loading coupons...</div>
  ) : availableCoupons.length === 0 ? (
    <div className="text-xs text-gray-500 py-3">No coupons available right now.</div>
  ) : (
    <div className="flex flex-col gap-3 max-h-[235px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
      {availableCoupons.map((coupon) => {
        const isExhaustedOrInactive = coupon.isExhausted || coupon.status !== 'Active';
        const isApplied = appliedCoupon?.code === coupon.code;
        const isMinAmountMet = subtotal >= Number(coupon.minOrderAmount || 0);
        const buttonDisabled = isApplied || !isMinAmountMet || applyingCoupon || isExhaustedOrInactive;

        return (
          <div
            key={coupon._id}
            className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all ${
              isApplied ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50/50'
            } ${
              isExhaustedOrInactive ? 'opacity-60 grayscale blur-[0.5px]' : ''
            }`}
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black tracking-wider uppercase ${isExhaustedOrInactive ? 'line-through text-slate-400 select-none blur-[2px]' : 'text-primary'}`}>
                  {coupon.code}
                </span>
                {isApplied && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Applied
                  </span>
                )}
                {coupon.isExhausted && (
                  <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                    Limit Reached
                  </span>
                )}
                {!coupon.isExhausted && coupon.status !== 'Active' && (
                  <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              <p className={`text-xs sm:text-sm font-semibold text-gray-800 mt-1 ${isExhaustedOrInactive ? 'text-gray-400' : ''}`}>
                {coupon.title}
              </p>

              <p className="text-[11px] text-gray-500 mt-1">
                Min order: ₹{Number(coupon.minOrderAmount || 0).toFixed(0)}
              </p>

              {!isMinAmountMet && !isExhaustedOrInactive && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  Add ₹{(Number(coupon.minOrderAmount || 0) - subtotal).toFixed(2)} more to use this coupon
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={buttonDisabled}
              onClick={() => handleQuickApplyCoupon(coupon.code)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isApplied
                  ? 'bg-emerald-600 text-white cursor-default'
                  : buttonDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-secondary text-white'
              }`}
            >
              {isApplied ? 'Applied' : coupon.isExhausted ? 'Limit Reached' : coupon.status !== 'Active' ? 'Inactive' : 'Apply'}
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>
          {/* Coupon Code Input Area */}


 


<div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
  <div className="flex items-center justify-between mb-3.5">
    <div>
      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight">
        Promotions & Coupons
      </h4>
      <p className="text-[10px] text-gray-400 font-medium">
        Apply a code to unlock extra savings
      </p>
    </div>
  </div>

  {!appliedCoupon ? (
    <form
      onSubmit={handleApplyCoupon}
      className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1"
    >
      <input
        type="text"
        placeholder="Enter Coupon Code"
        value={couponCode}
        onChange={(e) => {
          setCouponCode(e.target.value.toUpperCase());
          setLocalCouponError('');
        }}
        className="w-full bg-transparent pl-3 pr-2 py-2 text-xs sm:text-sm uppercase font-bold tracking-wider text-gray-800 placeholder:text-gray-400 focus:outline-none min-w-0"
      />

      <button
        type="submit"
        disabled={applyingCoupon || !couponCode.trim()}
        className="bg-gray-900 hover:bg-primary disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs px-4 py-2 rounded-lg transition-all shrink-0"
      >
        {applyingCoupon ? 'Applying...' : 'Apply'}
      </button>
    </form>
  ) : (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-black text-emerald-900 uppercase">
          {appliedCoupon.code}
        </p>
        <p className="text-[11px] text-emerald-700 mt-0.5">
          You saved <span className="font-bold">₹{couponDiscount.toFixed(2)}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleRemoveCoupon}
        className="text-[11px] font-bold text-red-600 border border-red-200 px-2.5 py-1 rounded-lg"
      >
        Remove
      </button>
    </div>
  )}

  {couponError && (
    <div className="mt-2.5 bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-rose-700 font-semibold text-[11px]">
      {couponError}
    </div>
  )}
</div>



          <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-4 sm:p-5 mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-emerald-600">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-500">
              <span>GST Tax</span>
              <span className="text-gray-900 font-bold">₹{gstAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-500">
              <span>Shipping</span>
              <span className="font-bold">
                {shippingFee === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span className="text-gray-900">₹{shippingFee.toFixed(2)}</span>
                )}
              </span>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-gray-800">Total Amount</span>
              <span className="text-lg sm:text-xl font-black text-gray-955">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

         
         <div className="flex flex-col min-[410px]:flex-row min-[410px]:items-center min-[410px]:justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
  <button
    type="button"
    onClick={() => setStep(1)}
    className="w-full min-[410px]:w-auto flex items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 bg-transparent rounded-xl py-2 px-3 cursor-pointer"
  >
    <ArrowLeft size={13} strokeWidth={2.5} />
    <span>Back to Address</span>
  </button>

  {hasUnavailableItems ? (
    <button
      type="button"
      disabled
      className="w-full min-[410px]:w-auto bg-gray-300 text-gray-500 font-semibold py-2 px-3 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed text-[11px] sm:text-xs"
    >
      <span>Remove Unavailable Items to Pay</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={handlePlaceOrder}
      className="w-full min-[410px]:w-auto bg-primary hover:bg-secondary text-white font-semibold py-2 px-3 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-[11px] sm:text-xs"
    >
      <span>Continue to Pay — ₹{total.toFixed(2)}</span>
    </button>
  )}
</div>


        </div>
      )}

      {/* ADD NEW ADDRESS MODAL POPUP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-8 relative z-10 border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-lg sm:text-xl font-black text-primary">Add Shipping Address</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-transparent border-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 font-sans text-left text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Zubair Zubair"
                    value={newAddress.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    placeholder="10-digit number"
                    value={newAddress.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                <input
                  type="text"
                  name="streetAddress"
                  required
                  placeholder="Street address, P.O. box, company"
                  value={newAddress.streetAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Apartment, suite, unit etc. (optional)</label>
                <input
                  type="text"
                  name="apartment"
                  placeholder="Apartment, suite, unit, building, floor"
                  value={newAddress.apartment}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                  <select
                    name="stateId"
                    required
                    value={newAddress.stateId}
                    onChange={handleStateChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-white"
                  >
                    <option value="">Select State</option>
                    {shippingStates.length === 0 ? (
                      <option value="" disabled>No states available</option>
                    ) : (
                      shippingStates.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.stateName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="6-digit ZIP/PIN code"
                    value={newAddress.pincode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={newAddress.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs sm:text-sm disabled:opacity-60"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-bold text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION FOR DELETE ADDRESS */}
      <ConfirmationModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />

      {/* ================= LOCAL / CCAVENUE GATEWAY TEST SIMULATION MODAL ================= */}
      {paymentStage !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] antialiased font-sans">
          
          {/* Local Sandbox Simulation Options Modal */}
          {paymentStage === 'sandbox_simulation' && devSimulationUrls && (
            <div className="bg-white rounded-[2rem] w-full max-w-[440px] p-8 shadow-2xl text-center relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-blue-100">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
              </div>

              <h3 className="text-[#2b183a] font-bold text-xl tracking-tight mb-2">Payment Testing Gateway</h3>
              <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed px-2 mb-6">
                Choose to simulate the payment callback directly or proceed to the CCAvenue Sandbox portal.
              </p>

              <div className="bg-[#f5f7f9] rounded-xl p-4 mb-6 text-left border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#556370]">
                  <span>Payment Provider:</span>
                  <span className="font-bold text-gray-800">CCAvenue Sandbox</span>
                </div>
                <div className="flex justify-between items-center text-[#556370]">
                  <span>Amount Due:</span>
                  <span className="font-bold text-gray-900 text-sm">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={devSimulationUrls.simulationUrl}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs border-0 text-center no-underline font-sans"
                >
                  <span>Simulate Payment Success</span>
                  <span className="bg-emerald-800/50 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">✓</span>
                </a>
                
                <a
                  href={devSimulationUrls.simulationFailureUrl}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs border-0 text-center no-underline font-sans"
                >
                  <span>Simulate Payment Failure</span>
                  <span className="bg-rose-800/50 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">✗</span>
                </a>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toast.info('Redirecting to CCAvenue Sandbox...');
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = devSimulationUrls.paymentUrl;
                    
                    const encRequestInput = document.createElement('input');
                    encRequestInput.type = 'hidden';
                    encRequestInput.name = 'encRequest';
                    encRequestInput.value = devSimulationUrls.encRequest;
                    form.appendChild(encRequestInput);
                    
                    const accessCodeInput = document.createElement('input');
                    accessCodeInput.type = 'hidden';
                    accessCodeInput.name = 'access_code';
                    accessCodeInput.value = devSimulationUrls.accessCode;
                    form.appendChild(accessCodeInput);
                    
                    document.body.appendChild(form);
                    form.submit();
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <span>Proceed to CCAvenue Sandbox Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStage('idle')}
                  className="w-full text-gray-400 hover:text-gray-600 text-xs font-semibold py-1 hover:underline cursor-pointer border-0 bg-transparent mt-1"
                >
                  Cancel & Go Back
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Checkout;