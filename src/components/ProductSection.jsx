import React from 'react';
import { Eye } from 'lucide-react';
import ProductCard from './ProductCard';

// 1. Add wishlist props down from your main app state handler here
// 1. Destructure the cart addition callback handler here
const ProductSection = ({ title, products, wishlist = [], onWishlist, onRemoveWishlist, onAddToCart }) => {
  return (
    <div className="w-full mt-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <a href="#" className="flex items-center gap-1.5 text-primary hover:text-secondary transition-colors text-sm font-semibold tracking-wide">
          <Eye size={18} strokeWidth={2.5} />
          View All
        </a>
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Products Grid */}
        <div className="flex-1 grid grid-cols-1 min-[350px]:grid-cols-2 min-[768px]:grid-cols-4 gap-6">
          {products.map(product => {
            const isSaved = wishlist.some(item => item.id === product.id);

            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={isSaved}
                onWishlist={onWishlist}
                onRemoveWishlist={onRemoveWishlist}
                onAddToCart={onAddToCart} // 2. Pass it down to the ProductCard
              />
            );
          })}
        </div>

        {/* Promo Banner Side */}
        <div className="hidden lg:block w-full lg:w-1/4 xl:w-[22%] flex-shrink-0">
          {/* Promo banner code remains identical */}
          <div className="w-full h-full min-h-[350px] bg-gradient-to-br from-[#FDBB49] to-[#F99F24] p-6 flex flex-col items-center text-center relative overflow-hidden group shadow-sm border border-orange-200">
            <div className="relative z-10 w-full flex flex-col items-center mt-2">
              <h3 className="text-white text-4xl mb-3 tracking-wide drop-shadow-sm" style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}>Mega Sale</h3>
              <p className="text-white mb-5 text-sm tracking-widest">
                UP TO <span className="text-2xl font-bold drop-shadow-sm">30%</span> OFF
              </p>
              <button className="bg-white text-[#F99F24] font-bold text-[13px] py-2 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all">
                SHOP NOW
              </button>
            </div>
            <div className="absolute right-4 bottom-24 bg-[#EBEBEB] rounded-full w-[70px] h-[70px] flex flex-col items-center justify-center shadow-lg z-20 transform group-hover:scale-110 transition-transform">
              <span className="text-[10px] font-bold text-gray-800 leading-tight">Starting at</span>
              <span className="text-[15px] font-bold text-gray-900 mt-0.5">₹1200</span>
            </div>
            <div className="relative z-10 mt-auto pt-10 pb-4 flex flex-col items-center justify-center">
              <div className="flex items-end gap-1">
                <div className="w-20 h-28 bg-[#F5F5F5] rounded-[20px] shadow-2xl border-4 border-[#E0E0E0] flex items-center justify-center relative overflow-hidden">
                   <div className="w-10 h-10 rounded-full bg-gray-800 border-4 border-gray-900 absolute top-4"></div>
                   <div className="w-12 h-6 rounded-full bg-gray-300 absolute bottom-3"></div>
                </div>
                <div className="w-24 h-32 bg-[#F5F5F5] rounded-[20px] shadow-2xl border-4 border-[#E0E0E0] flex items-center justify-center relative overflow-hidden">
                   <div className="w-12 h-12 rounded-full bg-gray-800 border-4 border-gray-900 absolute top-4"></div>
                   <div className="w-6 h-6 rounded-full bg-gray-300 absolute bottom-6 right-4"></div>
                   <div className="w-14 h-4 rounded-full bg-gray-300 absolute bottom-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;