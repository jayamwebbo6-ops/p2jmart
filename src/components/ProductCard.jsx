import React from 'react';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const ProductCard = ({ 
  product, 
  variant = "default",
  isWishlisted = false,
  onWishlist,
  onRemoveWishlist,
  onAddToCart,
  onClick // <-- This is the prop passed down by CustomizedProduct
}) => {
  const navigate = useNavigate();

  // 2. Centralized navigation handler
  const handleNavigation = (e) => {
    e.preventDefault();
    if (onClick) {
      // If a custom click handler is passed (like on the customization page), execute it
      onClick(product);
    } else {
      // Otherwise, fallback to the standard e-commerce details route
      navigate(`/product/${product.id}`, { state: { product } });
    }
  };

  return (
    <div 
      onClick={handleNavigation} // 3. Make the whole card area clickable/navigable cleanly
      className="border border-gray-200 bg-white group hover:shadow-md transition-shadow duration-300 flex flex-col h-full font-['Inter'] w-full min-w-0 overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center text-gray-400 font-sans text-center">
            <span className="text-sm font-medium">📷 No Image</span>
          </div>
        )}
        
        {/* Bottom border divider overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200/80 pointer-events-none z-10"></div>
        
        {/* Wishlist Actions (e.stopPropagation prevents the card's main handleNavigation from running) */}
        {variant === "wishlist" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveWishlist?.(product.id); }}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow border border-gray-100 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 z-10 cursor-pointer transition-all duration-200"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isWishlisted) { onRemoveWishlist?.(product.id); } else { onWishlist?.(product); }
            }}
            className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow border border-gray-100 z-10 cursor-pointer transition-colors"
          >
            <Heart size={16} strokeWidth={2} fill={isWishlisted ? "#EF4444" : "none"} className={isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"} />
          </button>
        )}
      </div>

      {/* Content Meta Details */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 min-w-0">
        {/* Title looks like an interactive anchor tag but safely executes the router sequence */}
        <span className="text-gray-800 font-medium text-[15px] truncate hover:text-[#009EDB] transition-colors block">
          {product.title}
        </span>
        
        <div className="flex flex-wrap items-baseline justify-between gap-x-1 gap-y-0.5 mt-1 w-full min-w-0">
          {product.price !== null && product.price !== undefined ? (
            <>
              <span className="text-[#003147] font-bold text-[16px] whitespace-nowrap">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-gray-400 text-[13px] line-through whitespace-nowrap flex-shrink-0">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-red-500 min-h-[24px] block">No unit pricing found</span>
          )}
        </div>
        
        {product.discount > 0 ? (
          <span className="text-green-600 text-[13px] font-medium block truncate">{product.discount}% Off</span>
        ) : (
          <span className="text-gray-400 text-[13px] font-medium block truncate">Standard Pack</span>
        )}

        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} strokeWidth={i < Math.floor(product.rating || 0) ? 0 : 1.5} className={i >= Math.floor(product.rating || 0) ? "text-gray-400" : ""} />
            ))}
          </div>
          <span className="text-gray-500 text-[12px] ml-1 truncate">({product.reviews || 0})</span>
        </div>
        
        {product.price !== null && product.price !== undefined && (
          <div className="mt-auto pt-0.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
              className="bg-[#003147] text-white text-xs font-medium py-2 px-3 rounded flex items-center gap-1.5 w-fit mt-2 hover:bg-[#009EDB] transition-colors cursor-pointer shadow-sm active:scale-95 max-w-full"
            >
              <ShoppingCart size={14} className="flex-shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;