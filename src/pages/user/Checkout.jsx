import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { initialAddresses } from '../../utils/mockAddresses';
import ConfirmationModal from '../../components/ConfirmationModal';

const Checkout = ({ cart = [], setCart }) => {
  const navigate = useNavigate();

  // Step state: 1 = Address, 2 = Payment/Order Summary, 3 = Order Success
  const [step, setStep] = useState(1);
  
  // Addresses local state
  const [addresses, setAddresses] = useState(() => {
    // Make sure we have the mock addresses and a customized one for Zubair
    const list = [...initialAddresses];
    const hasZubair = list.some(a => a.fullName.toLowerCase().includes('zubair'));
    if (!hasZubair) {
      list.push({
        id: 'zubair-address',
        fullName: 'zubair zubair',
        phoneNumber: '8610071893',
        streetAddress: 'tenkasi',
        apartment: '',
        city: 'Thenkasi',
        state: 'tamilnadu',
        pincode: '121258',
        isDefault: true
      });
    } else {
      list[0] = {
        ...list[0],
        fullName: 'zubair zubair',
        streetAddress: 'tenkasi',
        city: 'Thenkasi',
        state: 'tamilnadu',
        pincode: '121258',
        phoneNumber: '8610071893'
      };
    }
    return list;
  });

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Saved placed order details for Success Screen
  const [placedOrder, setPlacedOrder] = useState(null);

  // Math Calculations (sync with Cart.jsx)
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shippingFee;

  // Selected address object
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  // Redirect if cart is empty and we are not in success step
  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cart, step, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const newId = Date.now().toString();
    const addedAddress = {
      ...newAddress,
      id: newId
    };

    if (newAddress.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })).concat(addedAddress));
    } else {
      setAddresses(prev => [...prev, addedAddress]);
    }

    setSelectedAddressId(newId);
    setIsAddModalOpen(false);
    // Reset form
    setNewAddress({
      fullName: '',
      phoneNumber: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation(); // Prevent selecting the card
    setAddressToDelete(id);
  };

  const confirmDeleteAddress = () => {
    if (addressToDelete) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressToDelete));
      if (selectedAddressId === addressToDelete) {
        const remaining = addresses.filter(addr => addr.id !== addressToDelete);
        if (remaining.length > 0) {
          setSelectedAddressId(remaining[0].id);
        } else {
          setSelectedAddressId('');
        }
      }
      setAddressToDelete(null);
    }
  };

  const handleUseSelectedAddress = () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert("Please select a shipping address.");
      setStep(1);
      return;
    }

    // Generate random Order ID
    const randomId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    
    // Save order details to render on Success screen
    setPlacedOrder({
      orderId: randomId,
      items: [...cart],
      subtotal,
      shippingFee,
      total,
      address: { ...selectedAddress },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });

    // Clear cart and transition to Success step
    setCart([]);
    setStep(3);
  };

  if (step === 3 && placedOrder) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 font-sans flex flex-col items-center">
        {/* Success Header Card */}
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 border-4 border-green-100 shadow-inner">
            <Check size={40} strokeWidth={3} className="animate-bounce" />
          </div>
          
          <h2 className="text-2xl md:text-4xl font-black text-primary leading-tight mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mb-8">
            Thank you for your purchase. We have received your order, and our team is preparing it for delivery.
          </p>

          <hr className="w-full border-gray-100 mb-6" />

          {/* Details Grid */}
          <div className="w-full text-left bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <h3 className="font-bold text-primary text-lg mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 font-medium">Order ID</p>
                <p className="font-bold text-gray-900">{placedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Date Placed</p>
                <p className="font-bold text-gray-900">{placedOrder.date}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400 font-medium">Shipping Address</p>
                <div className="font-semibold text-gray-800 mt-1">
                  <p className="font-bold text-black capitalize">{placedOrder.address.fullName}</p>
                  <p className="text-gray-600">{placedOrder.address.streetAddress}{placedOrder.address.apartment ? `, ${placedOrder.address.apartment}` : ''}</p>
                  <p className="text-gray-600">{placedOrder.address.city}, {placedOrder.address.state} - {placedOrder.address.pincode}</p>
                  <p className="text-gray-800 mt-1 font-bold">PH: {placedOrder.address.phoneNumber}</p>
                </div>
              </div>
              <div className="md:col-span-2 border-t border-gray-200 pt-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 font-medium">Total Paid</p>
                  <p className="text-xs text-gray-400 font-normal">via Cash / Card / UPI</p>
                </div>
                <p className="text-2xl font-black text-primary">₹{placedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              to="/" 
              className="bg-primary hover:bg-secondary text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-center text-sm flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
            <Link 
              to="/my-account/orders" 
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
        
        {/* Step 1 Pill */}
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

        {/* Connector Line */}
        <div className={`w-12 sm:w-16 h-[2px] ${step === 2 ? 'bg-primary' : 'bg-gray-300'} transition-all`}></div>

        {/* Step 2 Pill */}
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
          
          {/* Header Card Area */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center text-primary border border-blue-100 flex-shrink-0">
              <MapPin size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight leading-none">Shipping Address</h2>
              <span className="text-[11px] sm:text-xs text-gray-400 mt-1 block">Select or Add New Location</span>
            </div>
          </div>

          {/* Stored Locations Header & Border */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Stored Locations</span>
            <div className="h-px bg-gray-100 w-full"></div>
          </div>

          {/* Address Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;
              return (
                <div 
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between bg-white relative cursor-pointer transition-all duration-300 select-none ${
                    isSelected 
                      ? 'border-primary border-2 shadow-[0_0_15px_rgba(0,49,71,0.06)]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom Radio Button */}
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

                  {/* Actions (Delete if not default or if there's multiple) */}
                  {addresses.length > 1 && (
                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
                      <button
                        onClick={(e) => handleDeleteAddress(address.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add New Address Card */}
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

          {/* Action button below */}
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
          
          {/* Header Card Area */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50/50 flex items-center justify-center text-primary border border-blue-100 flex-shrink-0">
              <ShoppingBag size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight leading-none">Order Summary</h2>
              <span className="text-[11px] sm:text-xs text-gray-400 mt-1 block">Please review your order details before payment</span>
            </div>
          </div>

          {/* Selected Address Summary Block */}
          {selectedAddress && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="font-sans">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Delivering To</p>
                <p className="font-extrabold text-sm text-gray-800 capitalize leading-none mb-1">{selectedAddress.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedAddress.streetAddress}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs font-bold text-secondary hover:underline"
              >
                Change Address
              </button>
            </div>
          )}

          {/* Product Items List */}
          <div className="flex flex-col gap-3">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {/* Image with mini-badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-black rounded-full border border-white"></div>
                  </div>
                  
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-1 max-w-[180px] sm:max-w-[320px]">
                      {item.title}
                    </h4>
                    <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">
                      Joy Gift House / Default Variant
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-1">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs sm:text-sm font-black text-gray-955">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Calculations Box */}
          <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-4 sm:p-5 mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
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

          {/* Bottom Button Layout */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Back button */}
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span>Back to Address</span>
            </button>

            {/* Pay Button */}
            <button 
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
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="State"
                    value={newAddress.state}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm bg-gray-50/50"
                  />
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
                  className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs sm:text-sm"
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
    </div>
  );
};

export default Checkout;
