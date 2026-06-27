import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from './toast';

const BACKEND_BASE_URL = "http://localhost:5000"; 

const ProductCard = ({ 
  product, 
  variant = "default",
  isWishlisted = false,
  onWishlist,
  onRemoveWishlist,
  onAddToCart,
  onClick
}) => {
  const navigate = useNavigate();

  const images = useMemo(() => {
    let list = [];
    
    // 1. Only push the core image if it's a real file path and not a placeholder or broken string
    if (
      product.image && 
      typeof product.image === 'string' && 
      !product.image.includes('placeholder') && 
      !product.image.includes('undefined') && 
      product.image.trim() !== ""
    ) {
      list.push(product.image);
    }

    // 2. Add all variant images safely
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (Array.isArray(v.images)) {
          list.push(...v.images);
        } else if (v.image) {
          list.push(v.image);
        }
      });
    }

    // 3. Clean up paths and attach the backend server base URL
    return [...new Set(list)]
      .map(imgSrc => {
        if (!imgSrc || typeof imgSrc !== 'string' || imgSrc.trim() === "" || imgSrc.includes('undefined')) {
          return null;
        }
        
        if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
          return imgSrc;
        }
        
        const cleanSrc = imgSrc.startsWith('/') ? imgSrc.slice(1) : imgSrc;
        return `${BACKEND_BASE_URL}/${cleanSrc}`;
      })
      .filter(Boolean);
  }, [product]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImgIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1200); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentImgIndex(0); // Safely snaps back to the absolute first *working* image path
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images]);

  const handleNavigation = (e) => {
    e.preventDefault();
    const targetId = product.id || product._id;
    if (onClick) {
      onClick(product);
    } else if (product.customizeProduct === 'Yes') {
      navigate(`/customizedProductDetail/${targetId}`, { state: { product } });
    } else {
      navigate(`/product/${targetId}`, { state: { product } });
    }
  };

  return (
    <div 
      onClick={handleNavigation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border border-gray-200 bg-white group hover:shadow-md transition-shadow duration-300 flex flex-col h-full font-['Inter'] w-full min-w-0 overflow-hidden cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {images.length > 0 && images[currentImgIndex] ? (
          <img 
            src={images[currentImgIndex]} 
            alt={product.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // If index 0 still fails dynamically for any reason, skip it and go straight to the next valid variant image
              if (currentImgIndex === 0 && images.length > 1) {
                setCurrentImgIndex(1);
              } else {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x600/FAFAFA/A3A3A3?text=Image+Unavailable"; 
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center text-gray-400 font-sans text-center">
            <span className="text-sm font-medium">📷 Image Unavailable</span>
          </div>
        )}
        
       

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200/80 pointer-events-none z-10"></div>
        
        {/* Wishlist Actions Button */}
        {variant === "wishlist" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveWishlist?.(product.id || product._id); }}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow border border-gray-100 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 z-10 cursor-pointer transition-all duration-200"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const targetId = product.id || product._id;
              if (isWishlisted) { onRemoveWishlist?.(targetId); } else { onWishlist?.(product); }
            }}
            className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow border border-gray-100 z-10 cursor-pointer transition-colors"
          >
            <Heart size={16} strokeWidth={2} fill={isWishlisted ? "#EF4444" : "none"} className={isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"} />
          </button>
        )}
      </div>

      {/* Content Meta Details */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 min-w-0">
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
              onClick={(e) => {
                e.stopPropagation();
                if (product?.customizeProduct === 'Yes') {
                  toast.info('Please provide customization (upload image or text) before adding to cart.');
                  const targetId = product.id || product._id;
                  navigate(`/customizedProductDetail/${targetId}`, { state: { product } });
                  return;
                }
                onAddToCart?.(product);
              }}
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