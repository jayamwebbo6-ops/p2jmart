import React, { useState } from 'react';
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

const Cart = ({ cart = [], updateQuantity, removeFromCart }) => {
  const [productToDelete, setProductToDelete] = useState(null);

  // Math Calculations based on image layout metrics
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
      removeFromCart(productToDelete.id);
      setProductToDelete(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center font-['Inter'] px-2">
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
        {/* Header Section: Stacks vertically at ultra-low widths to prevent overlap */}
        <div className="flex flex-col min-[240px]:flex-row min-[240px]:items-center justify-between border-b border-gray-100 pb-2 gap-1">
          <h1 className="text-sm sm:text-lg md:text-xl font-bold text-[#003147]">Your Items ({cart.length})</h1>
          <Link to="/" className="text-[11px] sm:text-sm font-semibold text-[#009EDB] hover:underline w-fit">Continue Shopping</Link>
        </div>

        {cart.map((item) => (
          /* Card Item Panel: Drops layout cleanly to full column architecture below 240px */
          <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-2.5 sm:p-4 shadow-sm flex flex-col min-[240px]:flex-row gap-3 relative">
            
            {/* Image wrapper: Centers image layout at ultra-low viewports */}
            <div className="flex justify-center min-[240px]:block flex-shrink-0">
              <div className="w-16 h-16 min-[240px]:w-20 min-[240px]:h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Middle text data & Quantity Selector */}
            <div className="flex-1 flex flex-col justify-between py-0.5 text-center min-[240px]:text-left">
              <div>
                <span className="text-[9px] sm:text-xs text-gray-400 font-medium">Joy Gift House</span>
                <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 mt-0.5 line-clamp-2">{item.title}</h3>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 rounded-full w-fit bg-white px-1 py-0.5 mt-2 mx-auto min-[240px]:mx-0">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 cursor-pointer">
                  <Minus size={10} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} />
                </button>
                <span className="px-1.5 sm:px-3 text-[11px] sm:text-sm font-bold text-gray-800 min-w-[16px] sm:min-w-[24px] text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 cursor-pointer">
                  <Plus size={10} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Right Side / Bottom Panel Area: Prices & Trash */}
            <div className="flex flex-row min-[240px]:flex-col justify-between items-center min-[240px]:items-end pt-2 min-[240px]:pt-0 border-t border-dashed border-gray-100 min-[240px]:border-0 gap-2">
              <button 
                onClick={() => handleOpenConfirmation(item)}
                className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors cursor-pointer min-[240px]:order-none order-2"
                title="Remove Item"
              >
                <Trash2 size={12} className="sm:w-[16px] sm:h-[16px]" />
              </button>
              
              <div className="text-left min-[240px]:text-right order-1 min-[240px]:order-none">
                <span className="block text-[9px] sm:text-[11px] text-gray-400">₹{Number(item.price).toFixed(2)} each</span>
                <span className="text-xs sm:text-base md:text-lg font-black text-[#003147]">₹{Number(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Bottom Trust badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-[#003147] px-2 py-1.5 rounded-lg text-[9px] sm:text-xs font-semibold shadow-sm">
            <ShieldCheck size={11} className="text-blue-600 flex-shrink-0" /> Secure
          </div>
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-[#003147] px-2 py-1.5 rounded-lg text-[9px] sm:text-xs font-semibold shadow-sm">
            <Truck size={11} className="text-blue-600 flex-shrink-0" /> Fast Delivery
          </div>
        </div>
      </div>

      {/* Right Container: Order Summary Panel */}
      <div className="w-full md:w-[280px] lg:w-[360px] bg-white border border-gray-100 shadow-sm rounded-2xl p-3.5 sm:p-6 flex flex-col gap-3.5 mt-2 md:mt-0">
        <h2 className="text-sm sm:text-lg font-bold text-[#003147] border-b border-gray-100 pb-2">Order Summary</h2>
        
        <div className="flex flex-col gap-2 text-[11px] sm:text-sm font-medium text-gray-600">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Shipping</span>
            <span className="text-gray-900 font-bold">
              {shippingFee === 0 ? <span className="text-green-600 font-semibold">Free</span> : `₹${shippingFee.toFixed(2)}`}
            </span>
          </div>
        </div>

        {amountNeededForFreeShipping > 0 ? (
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-2.5 flex flex-col gap-1.5">
            <p className="text-[9px] sm:text-xs font-medium text-primary">
              Spend <span className="font-bold">₹{amountNeededForFreeShipping}</span> more for free shipping!
            </p>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-xl p-2 text-center text-[9px] sm:text-xs font-bold text-green-700">
            🎉 Free Shipping!
          </div>
        )}

        <hr className="border-gray-100" />

        <div className="flex justify-between items-baseline gap-1">
          <span className="text-xs sm:text-sm font-bold text-[#003147]">Total</span>
          <div className="text-right">
            <span className="text-sm sm:text-2xl font-black text-secondary block leading-none">₹{total.toFixed(2)}</span>
            <span className="text-[8px] sm:text-[10px] text-gray-400 mt-1 block leading-tight">Incl. GST and taxes</span>
          </div>
        </div>

        <Link to="/checkout" className="w-full bg-[#003147] hover:bg-[#009EDB] active:scale-[0.99] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-[11px] sm:text-sm mt-1 text-center">
          <span className="truncate">Proceed to Checkout</span>
          <ArrowRight size={12} className="flex-shrink-0" />
        </Link>

        <div className="text-center">
          <p className="text-[8px] sm:text-[10px] text-gray-400 leading-tight">
            By proceeding: <Link to="/returns-policy" className="text-secondary hover:underline">Terms & Conditions</Link> 
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Item from Cart"
        message={`Are you sure you want to remove "${productToDelete?.title || 'this item'}"?`}
        confirmText="Remove"
        cancelText="Keep Item"
        isDanger={true}
      />
    </div>
  );
};

export default Cart;