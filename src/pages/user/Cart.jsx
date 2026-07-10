import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck, Layers, Ticket } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

const Cart = ({
  cart = [],
  updateQuantity,
  removeFromCart,
  clearCart,
  setCart,
  onAddToCart,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponDiscount,
  couponError,
  applyingCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) => {
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

  useEffect(() => {
    if (location.state && location.state.incomingBundle) {
      const bundle = location.state.incomingBundle;
      navigate(location.pathname, { replace: true, state: {} });
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

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalWeight = cart.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);
  const shippingFee = subtotal > 1000 || subtotal === 0 || totalWeight === 0 ? 0 : 100;
  const total = Math.max(0, subtotal - Number(couponDiscount || 0));

  const hasOutOfStockItems = cart.some(item => {
    return item.isActiveProduct === false || item.availableStock === 0 || item.quantity > item.availableStock;
  });

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
      <div className="flex flex-col items-center justify-center text-center font-['Inter'] px-4 py-20">
        <h2 className="text-lg font-bold text-[#003147] mb-1">Your Cart is Empty</h2>
        <p className="text-gray-500 text-xs mb-4">Add items to your cart to see them here.</p>
        <Link to="/" className="bg-[#003147] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#009EDB] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    /* Base wrapper layout: stacks on mobile (<800px), shifts side-by-side at >=801px */
    <div className="w-full pt-6 flex flex-col min-[801px]:flex-row gap-6 font-['Inter'] items-start px-2 min-[350px]:px-4 max-w-7xl mx-auto">       
      
      {/* Left Container: Items list */}
      <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
        <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-lg font-bold text-[#003147]">Your Items ({cart.length})</h1>
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="text-[#9E2A2B] bg-red-50 border border-red-100 hover:bg-red-100 transition-colors rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            >
              Clear
            </button>
          </div>
          <Link to="/" className="text-xs font-semibold text-[#009EDB] hover:underline">Continue Shopping</Link>
        </div>

        <div className={cart.length > 3 ? 'max-h-[calc(100vh-220px)] overflow-y-auto pr-1' : ''}>
          {cart.map((item) => (
            <div key={item.id || item._id} className={`bg-white border border-gray-200 rounded-2xl mb-4 p-3 sm:p-4 shadow-sm flex flex-col gap-3 relative ${item.isComboProduct ? ' bg-gradient-to-r from-white to-blue-50/30' : ''}`}>
            
              {/* Responsive Frame: Stacked on tiny screens (<350px), side-by-side on larger screens */}
              <div className="flex flex-col min-[350px]:flex-row gap-3 items-center min-[350px]:items-start w-full">
                
                {/* Large, High-Visibility Image Container */}
                <div className="shrink-0 w-full min-[350px]:w-24 sm:w-28 aspect-square min-[350px]:h-24 sm:h-28 max-w-[140px] min-[350px]:max-w-none">
                  <Link 
                    to={item.isComboProduct && item.includedProducts?.[0]
                      ? `/product/${item.includedProducts[0].id || item.includedProducts[0]._id}`
                      : `/product/${item.productId || item.id || item._id}`
                    }
                    className="w-full h-full bg-slate-50 rounded-xl overflow-hidden border border-gray-200 relative block cursor-pointer"
                  >
                    <img 
                      src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))} 
                      alt={item.title} 
                      className="w-full h-full object-contain p-1 mix-blend-multiply hover:scale-105 transition-transform duration-200" 
                    />
                    {item.isComboProduct && (
                      <div className="absolute bottom-0 inset-x-0 bg-blue-900/90 text-white text-[8px] font-bold text-center py-0.5 uppercase flex items-center justify-center gap-0.5">
                        <Layers size={8} /> Combo
                      </div>
                    )}
                  </Link>
                </div>

                {/* Middle text details */}
                <div className="flex-1 min-w-0 text-center min-[350px]:text-left w-full">
                  <div className="flex items-center justify-center min-[350px]:justify-start gap-2 flex-wrap mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      Joy Gift House
                    </span>
                    {item.isComboProduct && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        ✨ Bundle
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-gray-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div>
                      <span className="text-[11px] text-gray-400 font-medium mr-1">Unit Price:</span>
                      <span className="text-xs font-bold text-gray-600">₹{item.price}</span>
                    </div>
                    {(item.isActiveProduct === false ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Unavailable
                      </span>
                    ) : item.availableStock === 0 ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Out of Stock
                      </span>
                    ) : item.quantity > item.availableStock ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        Only {item.availableStock} units available
                      </span>
                    ) : null)}
                  </div>
                </div>
              </div>

              {/* --- DYNAMIC NESTED SUB-ITEMS RENDER FOR COMBO PACKS --- */}
              {item.isComboProduct && item.includedProducts && (
                <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 shadow-inner">
                  <div className="flex items-center gap-1 mb-1.5 border-b border-slate-200/40 pb-1">
                    <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                      Included Layout Customizations ({item.includedProducts.length} items)
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {item.includedProducts.map((subItem, index) => (
                      <div 
                        key={`${subItem.id || subItem.productId}-${subItem.variantId || 'default'}-${index}`} 
                        className="flex items-center justify-between gap-2 bg-white border border-slate-100 p-1 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-md bg-slate-100 overflow-hidden shrink-0">
                            <img 
                              src={formatImageUrl(subItem.image)} 
                              alt={subItem.productName || subItem.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="truncate font-medium text-gray-800 text-[11px]">
                            {subItem.productName || subItem.title}
                          </span>
                        </div>
                        <div className="shrink-0 bg-slate-100 text-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                          QTY: {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Rows Area (Counter + Delete Action + Item Totals) */}
              <div className="w-full flex flex-col min-[350px]:flex-row items-center justify-between pt-2.5 border-t border-gray-100 gap-2 mt-1">
                <div className="flex items-center gap-3 justify-between w-full min-[350px]:w-auto">
                  <div className="flex items-center border border-gray-200 rounded-full bg-white px-1 py-0.5 shadow-sm">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.id || item._id, -1) : handleOpenConfirmation(item)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-800 min-w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id || item._id, 1)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleOpenConfirmation(item)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium"
                  >
                    <Trash2 size={13} /> <span>Remove</span>
                  </button>
                </div>

                <div className="text-right flex min-[350px]:flex-col items-center min-[350px]:items-end justify-between w-full min-[350px]:w-auto border-t min-[350px]:border-t-0 pt-1.5 min-[350px]:pt-0 border-dashed border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium min-[350px]:mb-0.5">Total:</span>
                  <span className="text-xs sm:text-sm font-black text-[#003147]">₹{item.price * item.quantity}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Right Side Order Summary calculation box: Holds fixed 80px width ONLY at >=801px layout setups */}
      <div className="w-full shrink-0 min-[801px]:w-80 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 min-w-0">
        <h2 className="text-xs sm:text-base font-bold text-[#003147] border-b border-gray-100 pb-2">Order Summary</h2>
        
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-1.5 text-[#003147] font-semibold text-xs mb-2">
            <Ticket size={13} />
            <span>Apply Promo Code</span>
          </div>
          {!appliedCoupon ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onApplyCoupon?.(subtotal, couponCode);
              }}
              className="w-full"
            >
              <div className="flex gap-1.5 w-full items-start">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={couponCode || ''}
                    onChange={(e) => setCouponCode?.(e.target.value)}
                    placeholder="Coupon"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#009EDB]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="bg-[#009EDB] hover:bg-[#007fb0] disabled:opacity-70 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-600 mt-1">{couponError}</p>}
            </form>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold truncate">{appliedCoupon.code}</span>
                <button type="button" onClick={onRemoveCoupon} className="text-[11px] font-semibold underline shrink-0">Remove</button>
              </div>
              <p className="mt-0.5 text-[10px]">Discount: {Number(couponDiscount) > 0 ? '-' : ''}₹{Number(couponDiscount).toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-900">₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="font-bold text-emerald-600">
              {Number(couponDiscount) > 0 ? '-' : ''}₹{Number(couponDiscount).toFixed(2)}
            </span>
          </div>
          <hr className="border-gray-100 my-0.5" />
          <div className="flex justify-between text-sm sm:text-base font-black text-[#003147]">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
        </div>

        <div className="w-full">
          {hasOutOfStockItems ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-not-allowed shadow-none"
            >
              Checkout (Remove Unavailable Items)
            </button>
          ) : (
            <Link 
              to="/checkout" 
              className="w-full bg-[#003147] hover:bg-[#002232] text-white py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              Checkout <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
          <ShieldCheck size={13} className="text-green-600 shrink-0" />
          <span>Secure Checkout Guarantee</span>
        </div>
      </div>

      {/* Modals placeholders */}
      <ConfirmationModal 
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Item"
        message={`Are you sure you want to remove "${productToDelete?.title}"?`}
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