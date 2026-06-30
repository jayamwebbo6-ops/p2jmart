import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck, Layers } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

// FIXED: Added passed structural dependency setCart to accept remote data transfers
const Cart = ({ cart = [], updateQuantity, removeFromCart, clearCart, setCart, onAddToCart }) => {
  const [productToDelete, setProductToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image+Available";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`;
  };

  /* ==========================================================================
      INTERMEDIARY HANDLER FOR CAPTURING ROUTER STATE BUNDLES
     ========================================================================== */
  useEffect(() => {
    if (location.state && location.state.incomingBundle) {
      const bundle = location.state.incomingBundle;

      // Clean historical router state context references FIRST to prevent duplicate triggers
      navigate(location.pathname, { replace: true, state: {} });

      // Ensure the collection item is not already inside the active layout context
      const bundleExists = cart.some(item => (item.id === bundle.id || item._id === bundle.id || item.productId === bundle.id));

      if (!bundleExists) {
        if (typeof onAddToCart === 'function') {
          onAddToCart(bundle);
        } else if (typeof setCart === 'function') {
          setCart(prevCart => [...prevCart, bundle]);
        }
      }
    }
  }, [location.state, navigate, location.pathname, onAddToCart, cart, setCart]);

  // Calculations based on current cart contents
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 100; 
  const freeShippingThreshold = 1000;
  const amountNeededForFreeShipping = freeShippingThreshold - subtotal;
  const total = subtotal + shippingFee;

  const handleOpenConfirmation = (item) => {
    setProductToDelete(item);
  };

  const handleConfirmRemove = () => {
    if (productToDelete) {
      removeFromCart(productToDelete.id || productToDelete._id);
      setProductToDelete(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center font-['Inter'] px-2 py-20">
        <h2 className="text-lg md:text-2xl font-bold text-[#003147] mb-1">Your Cart is Empty</h2>
        <p className="text-gray-500 text-[11px] md:text-sm mb-4">Add items to your cart to see them here.</p>
        <Link to="/" className="bg-[#003147] text-white text-[11px] md:text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#009EDB] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-10 flex flex-col md:flex-row gap-4 font-['Inter'] items-start px-1 sm:px-0">
      
      {/* Left Container: Items list */}
      <div className="flex-1 w-full flex flex-col gap-3">
        <div className="flex flex-col min-[240px]:flex-row min-[240px]:items-center justify-between border-b border-gray-100 pb-2 gap-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-[#003147]">Your Items ({cart.length})</h1>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="text-[#9E2A2B] bg-red-50 border border-red-100 hover:bg-red-100 transition-colors rounded-full px-3 py-2 text-[11px] sm:text-xs font-semibold"
              >
                Clear Cart
              </button>
            )}
          </div>
          <Link to="/" className="text-[11px] sm:text-sm font-semibold text-[#009EDB] hover:underline w-fit">Continue Shopping</Link>
        </div>

        <div className={cart.length > 3 ? 'max-h-[calc(100vh-200px)] overflow-y-auto pr-2' : ''}>
          {cart.map((item) => (
            <div key={item.id || item._id} className={`bg-white border border-gray-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 relative ${item.isComboProduct ? ' bg-gradient-to-r from-white to-blue-50/30' : ''}`}>
            
            {/* Image wrapper */}
            <div className="flex justify-start sm:block flex-shrink-0">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                {/* Fallback image handle for standard bundle components schema */}
                <img src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))} alt={item.title} className="w-full h-full object-cover" />
                {item.isComboProduct && (
                  <div className="absolute bottom-0 inset-x-0 bg-blue-900/90 text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-0.5">
                    <Layers size={8} /> Combo
                  </div>
                )}
              </div>
            </div>

            {/* Middle text data & Quantity Selector */}
            <div className="flex-1 flex flex-col justify-between py-0.5 text-left min-w-0">
              
              <div>
                {/* Badges & Vendor Line */}
                <div className="flex items-center justify-start gap-2 flex-wrap mb-1.5">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-semibold tracking-wide uppercase">
                    Joy Gift House
                  </span>
                  {item.isComboProduct && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      ✨ Combo Bundle Savings Deal
                    </span>
                  )}
                </div>

                {/* Main Item Title */}
                <h3 className="text-[13px] sm:text-base font-extrabold text-gray-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                
                {/* --- DYNAMIC NESTED SUB-ITEMS RENDER FOR COMBO PACKS --- */}
                {item.isComboProduct && item.includedProducts && (
                  <div className="mt-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3 w-full max-w-full shadow-inner">
                    <div className="flex items-center gap-1.5 mb-2 border-b border-slate-200/40 pb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                        Included Package Customizations ({item.includedProducts.length} items)
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {item.includedProducts.map((subItem, index) => (
                        <div 
                          key={subItem.id || index} 
                          className="flex items-center justify-between gap-3 bg-white border border-slate-100 p-1.5 rounded-lg hover:border-blue-200 transition-colors shadow-sm"
                        >
                          {/* Thumbnail + Title Group */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-slate-100 border border-slate-200/85 overflow-hidden shrink-0 shadow-sm">
                              <img 
                                src={formatImageUrl(subItem.image)} 
                                alt={subItem.productName || subItem.title} 
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" 
                              />
                            </div>
                            <span className="truncate font-semibold text-gray-800 text-xs sm:text-sm">
                              {subItem.productName || subItem.title}
                            </span>
                          </div>

                          {/* Individual Item Multiplier Counter Badge */}
                          <div className="shrink-0 bg-slate-100 text-slate-700 font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200/50">
                            QTY: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="flex items-center border border-gray-200 rounded-full w-fit bg-white px-1 py-0.5">
                  <button 
                    onClick={() => item.quantity > 1 ? updateQuantity(item.id || item._id, -1) : handleOpenConfirmation(item)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-800 min-w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id || item._id, 1)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => handleOpenConfirmation(item)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>

            {/* Right Side Price Displays */}
            <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
              <span className="text-xs text-gray-400 block sm:hidden font-medium">Total:</span>
              <span className="text-sm sm:text-base font-black text-[#003147]">₹{item.price * item.quantity}</span>
            </div>

          </div>
          ))}
        </div>
      </div>
      {/* Right Side calculations layout summary section */}
      <div className="w-full md:w-80 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-5">
        <h2 className="text-sm sm:text-base font-bold text-[#003147] border-b border-gray-50 pb-2">Order Summary</h2>
        
        {amountNeededForFreeShipping > 0 ? (
          <div className="bg-blue-50/50 border border-blue-100 text-[#003147] text-[11px] p-2.5 rounded-lg flex items-center gap-2">
            <Truck size={16} className="text-[#009EDB] shrink-0" />
            <span>Add <strong>₹{amountNeededForFreeShipping}</strong> more for <strong>FREE SHIPPING!</strong></span>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 text-green-800 text-[11px] p-2.5 rounded-lg flex items-center gap-2">
            <Truck size={16} className="text-green-600 shrink-0" />
            <span>🎉 Your order qualifies for <strong>Free Shipping!</strong></span>
          </div>
        )}

        <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-900">₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Shipping:</span>
            <span className="font-bold text-gray-900">{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
          </div>
          <hr className="border-gray-100 my-1" />
          <div className="flex justify-between text-base font-black text-[#003147]">
            <span>Total Amount:</span>
            <span>₹{total}</span>
          </div>
        </div>

        <Link to="/checkout" className="w-full bg-[#003147] hover:bg-[#002232] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md mt-2">
          Proceed to Checkout <ArrowRight size={16} />
        </Link>

        <div className="flex flex-col gap-2 mt-2 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
            <ShieldCheck size={16} className="text-green-600 shrink-0" />
            <span>100% Safe and Secure Payments.</span>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Item"
        message={`Are you sure you want to remove "${productToDelete?.title}" from your shopping cart?`}
      />
      <ConfirmationModal 
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          clearCart();
          setShowClearModal(false);
        }}
        title="Clear Cart"
        message="Are you sure you want to remove all products from your cart?"
        confirmText="Clear All"
        cancelText="Keep Items"
      />
    </div>
  );
};

export default Cart;