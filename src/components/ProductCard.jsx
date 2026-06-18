import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="border border-gray-200 bg-white group hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link 
        to={`/product/${product.id}`} 
        state={{ product }} 
        className="relative aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden block"
      >
        {/* Actual Image with absolute fallback structure */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center text-gray-400 font-sans text-center">
            <span className="text-sm font-medium">📷 No Image</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow border border-gray-100 text-primary hover:text-secondary hover:shadow-md transition-all z-10" 
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} strokeWidth={2} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <Link 
          to={`/product/${product.id}`} 
          state={{ product }} 
          className="text-gray-800 font-medium text-[15px] truncate hover:text-primary transition-colors"
        >
          {product.title}
        </Link>
        
        {/* Price Row Guarding Against Null Values */}
        <div className="flex items-center gap-2 mt-1">
          {product.price !== null && product.price !== undefined ? (
            <>
              <span className="text-primary font-bold text-[16px]">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice !== null && product.originalPrice !== undefined && (
                <span className="text-gray-400 text-[13px] line-through decoration-gray-400">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-red-500 min-h-[24px] block">
              No unit pricing found
            </span>
          )}
        </div>
        
        {/* Discount Guard */}
        {product.discount > 0 ? (
          <span className="text-green-600 text-[13px] font-medium">{product.discount}% Off</span>
        ) : (
          <span className="text-gray-400 text-[13px] font-medium">Standard Pack</span>
        )}

        {/* Ratings block */}
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} 
                strokeWidth={i < Math.floor(product.rating || 0) ? 0 : 1.5} 
                className={i >= Math.floor(product.rating || 0) ? "text-gray-400" : ""} 
              />
            ))}
          </div>
          <span className="text-gray-500 text-[12px] ml-1">
            ({product.reviews || 0})
          </span>
        </div>
        
        {/* Add to Cart button */}
        {product.price !== null && product.price !== undefined && (
          <button className="bg-primary text-white text-xs font-medium py-2 px-3 rounded flex items-center gap-1.5 w-fit mt-2 hover:bg-secondary transition-colors">
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;