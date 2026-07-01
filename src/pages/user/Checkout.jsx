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
import { createOrderAPI } from '../../api/orderApi';
import { fetchCart } from '../../redux/cartSlice';
import { getHomeCMS } from '../../api/homeCms';
import { isUserAuthenticated } from '../../api/userApi';

const Checkout = ({ cart = [], setCart }) => {
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

  // Selected address object
  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  // Math Calculations
  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const shippingFee = (() => {
    if (!selectedAddress || checkoutItems.length === 0) return 0;

    // Check if any product has freeShipping === 'No'
    const hasNonFreeShippingItem = checkoutItems.some(item => {
      const isFree = item.freeShipping === 'Yes' || (item.productId && item.productId.freeShipping === 'Yes');
      return !isFree;
    });

    if (hasNonFreeShippingItem) {
      // Calculate weight-based shipping only for non-free-shipping items
      const nonFreeItems = checkoutItems.filter(item => {
        const isFree = item.freeShipping === 'Yes' || (item.productId && item.productId.freeShipping === 'Yes');
        return !isFree;
      });

      const totalWeight = nonFreeItems.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);
      if (totalWeight === 0) return 0;

      const threshold = Number(globalShippingRules.freeShippingMinAmount) || 1000;
      const flatCost = Number(globalShippingRules.flatShippingCost) || 50;

      if (!shippingStates.length) {
        return subtotal >= threshold ? 0 : flatCost;
      }
      const rule = shippingStates.find(s => s.stateName.trim().toLowerCase() === selectedAddress.state.trim().toLowerCase());
      if (!rule) {
        return subtotal >= threshold ? 0 : flatCost;
      }
      if (totalWeight <= rule.baseWeight) {
        return rule.baseCost;
      } else {
        const extraWeight = totalWeight - rule.baseWeight;
        const extraUnits = Math.ceil(extraWeight / rule.additionalWeight);
        return rule.baseCost + (extraUnits * rule.additionalCost);
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

  const total = subtotal + gstAmount + shippingFee;

  // Load addresses, shipping states, and GST configurations from database
  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      const [addressRes, shippingRes, gstRes, cmsRes] = await Promise.all([
        getMyAddressesAPI(),
        getAllShippingAPI(),
        getAllGstAPI(),
        getHomeCMS()
      ]);

      if (addressRes && addressRes.success) {
        setAddresses(addressRes.data);
        const defAddr = addressRes.data.find(a => a.isDefault);
        if (defAddr) {
          setSelectedAddressId(defAddr._id);
        } else if (addressRes.data.length > 0) {
          setSelectedAddressId(addressRes.data[0]._id);
        }
      }
      
      if (shippingRes && shippingRes.success) {
        setShippingStates(shippingRes.data);
      }

      if (gstRes && gstRes.success) {
        setGstSettings(gstRes.data);
      }

      if (cmsRes && cmsRes.success && cmsRes.data) {
        setGlobalShippingRules({
          freeShippingMinAmount: cmsRes.data.freeShippingMinAmount !== undefined ? cmsRes.data.freeShippingMinAmount : 1000,
          flatShippingCost: cmsRes.data.flatShippingCost !== undefined ? cmsRes.data.flatShippingCost : 50
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load checkout settings');
    } finally {
      setLoading(false);
    }
  };




 


  useEffect(() => {
    if (!isUserAuthenticated()) {
      toast.info('Please login to proceed to checkout.');
      navigate('/login', { state: { from: '/checkout', checkoutState: location.state } });
    } else {
      loadCheckoutData();
    }
  }, [navigate, location]);

  // Redirect if checkout items are empty and we are not in success step
  useEffect(() => {
    if (checkoutItems.length === 0 && step !== 3 && paymentStage === 'idle') {
      navigate('/cart');
    }
  }, [checkoutItems, step, navigate, paymentStage]);

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

  const handleUseSelectedAddress = useThrottledCallback(() => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }
    setStep(2);
  }, 1000);

  const handlePlaceOrder = useThrottledCallback(() => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      setStep(1);
      return;
    }
    const generatedRef = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderRef(generatedRef);
    setPaymentStage('gateway_modal');
  }, 1000);

  const [paymentSuccess, setPaymentSuccess] = useState(true);

  const finalizeFailedPayment = async () => {
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
        paymentMethod: 'UPI/Card (Simulated)',
        paymentStatus: 'unpaid',
        subtotal: Number(subtotal),
        gst: Number(gstAmount),
        shippingFee: Number(shippingFee),
        total: Number(total),
        isDirectPurchase: isDirectPurchase
      };

      const res = await createOrderAPI(orderPayload);
      if (res && res.success) {
        toast.error('Payment failed. Order placed as unpaid.');
        setPlacedOrder(res.data);

        if (!isDirectPurchase) {
          dispatch(fetchCart());
          setCart([]);
        }
        setStep(3);
      } else {
        toast.error(res.message || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error creating unpaid order');
    } finally {
      setPaymentStage('idle');
      setLoading(false);
    }
  };

  const finalizeSuccessfulPayment = async () => {
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
        paymentMethod: 'UPI/Card (Simulated)',
        paymentStatus: 'paid',
        subtotal: Number(subtotal),
        gst: Number(gstAmount),
        shippingFee: Number(shippingFee),
        total: Number(total),
        isDirectPurchase: isDirectPurchase
      };

      // This single API request now saves the order, clears the cart, and triggers the email!
      const res = await createOrderAPI(orderPayload);
      if (res && res.success) {
        toast.success(res.message || 'Order placed successfully');
        setPlacedOrder(res.data);

        if (!isDirectPurchase) {
          dispatch(fetchCart());
          setCart([]);
        }
        setStep(3);
      } else {
        toast.error(res.message || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error creating order');
    } finally {
      setPaymentStage('idle');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentStage === 'bank_redirect') {
      const timer = setTimeout(() => {
        if (paymentSuccess) {
          finalizeSuccessfulPayment();
        } else {
          finalizeFailedPayment();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [paymentStage, paymentSuccess]);

  if (step === 3 && placedOrder) {
    const isPaid = placedOrder.paymentStatus === 'paid';
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 font-sans flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
          {isPaid ? (
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 border-4 border-green-100 shadow-inner">
              <Check size={40} strokeWidth={3} className="animate-bounce" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-6 border-4 border-amber-100 shadow-inner">
              <Clock size={40} strokeWidth={3} className="animate-pulse" />
            </div>
          )}
          
          <h2 className="text-2xl md:text-4xl font-black text-primary leading-tight mb-2">
            {isPaid ? 'Order Placed Successfully!' : 'Payment Failed / Pending'}
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mb-8">
            {isPaid 
              ? 'Thank you for your purchase. We have received your order, and our team is preparing it for delivery.'
              : 'Your payment was not completed. The stock for your items has been temporarily reserved for 15 minutes. Please complete payment within this window, or the order will be cancelled automatically.'}
          </p>

          <hr className="w-full border-gray-100 mb-6" />

          <div className="w-full text-left bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <h3 className="font-bold text-primary text-lg mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 font-medium">Order ID</p>
                <p className="font-bold text-gray-900">{placedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Date Placed</p>
                <p className="font-bold text-gray-900">
                  {new Date(placedOrder.placedDate || placedOrder.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400 font-medium">Shipping Address</p>
                <div className="font-semibold text-gray-800 mt-1">
                  <p className="font-bold text-black capitalize">{placedOrder.shippingAddress?.fullName}</p>
                  <p className="text-gray-600">{placedOrder.shippingAddress?.streetAddress}{placedOrder.shippingAddress?.apartment ? `, ${placedOrder.shippingAddress.apartment}` : ''}</p>
                  <p className="text-gray-600">{placedOrder.shippingAddress?.city}, {placedOrder.shippingAddress?.state} - {placedOrder.shippingAddress?.pincode}</p>
                  <p className="text-gray-800 mt-1 font-bold">PH: {placedOrder.shippingAddress?.phoneNumber}</p>
                </div>
              </div>
              <div className="md:col-span-2 border-t border-gray-200 pt-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 font-medium">{isPaid ? 'Total Paid' : 'Total Amount Due'}</p>
                  <p className="text-xs text-gray-400 font-normal">{isPaid ? 'via Cash / Card / UPI' : 'Temporary Hold: 15 mins'}</p>
                </div>
                <p className="text-2xl font-black text-primary">₹{placedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              to="/" 
              className="bg-primary hover:bg-secondary text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-center text-sm flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
            <Link 
              to="/my-account" 
              className="border border-primary text-primary hover:bg-gray-50 font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 text-center text-sm flex items-center justify-center gap-2"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-4 font-sans">
      
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
                  </div>
                </div>
                
                <span className="text-xs sm:text-sm font-black text-gray-955 shrink-0 mt-1">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-4 sm:p-5 mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
            </div>

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

          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span>Back to Address</span>
            </button>

            <button 
              type="button"
              onClick={handlePlaceOrder}
              className="bg-primary hover:bg-secondary text-white font-bold py-3 px-5 sm:px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer text-xs sm:text-sm"
            >
              <span>Continue to Pay — ₹{total.toFixed(2)}</span>
            </button>
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

      {/* ================= SIMULATED CHECKOUT GATEWAY WORKFLOW MODAL LAYER ================= */}
      {paymentStage !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] antialiased font-sans">
          
          {/* PHASE 1: Simulated Checkout Gateway Interface Modal */}
          {paymentStage === 'gateway_modal' && (
            <div className="bg-white rounded-[2rem] w-full max-w-[420px] p-8 shadow-2xl text-center relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-emerald-100/50">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
              </div>

              <h3 className="text-[#2b183a] font-bold text-xl tracking-tight mb-2">Simulated Checkout Gateway</h3>
              <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed px-2 mb-6">
                 You can mock test the payment flow below.
              </p>

              <div className="bg-[#f5f7f9] rounded-xl p-4 mb-6 text-left border border-gray-100 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#556370]">
                  <span>Order Reference:</span>
                  <span className="font-bold text-gray-800 tracking-wide">{orderRef}</span>
                </div>
                <div className="flex justify-between items-center text-[#556370]">
                  <span>Amount Due:</span>
                  <span className="font-bold text-gray-900 text-base">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSuccess(true);
                    setPaymentStage('bank_redirect');
                  }}
                  className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2 shadow-xs border-0"
                >
                  <span>Simulate Payment Success</span>
                  <span className="bg-[#a4f1b5] text-[#34633d] w-4 h-4 rounded flex items-center justify-center text-[10px]">✓</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSuccess(false);
                    setPaymentStage('bank_redirect');
                  }}
                  className="w-full bg-rose-50/50 hover:bg-rose-50 text-rose-700 font-semibold py-3 px-4 rounded-xl border border-rose-100 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  <span>Simulate Payment Failure</span>
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: Bank Redirect Simulator Loader */}
          {paymentStage === 'bank_redirect' && (
            <div className="bg-white rounded-[2rem] w-full max-w-[360px] p-8 shadow-2xl text-center border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-900 font-bold text-base mb-1">Verifying with Bank</p>
              <p className="text-gray-400 text-xs">Please do not refresh or close this window...</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Checkout;