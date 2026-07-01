import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useThrottledCallback from '../hooks/useThrottledCallback';
import { toast } from './toast';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"; 

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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());
  const imgRef = useRef(null);



  useEffect(() => {
    setBrokenImages(new Set());
    setImageLoaded(false);
    setCurrentImgIndex(0);
  }, [product.id, product._id]);

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

    // 2. Always push the first variant's image as a fallback primary/secondary option if available
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstVar = product.variants[0];
      if (firstVar) {
        if (Array.isArray(firstVar.images) && firstVar.images.length > 0) {
          list.push(firstVar.images[0]);
        } else if (firstVar.image) {
          list.push(firstVar.image);
        }
      }
    }

    // 3. Add other variant images safely ONLY on hover
    if (isHovered && product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (Array.isArray(v.images)) {
          list.push(...v.images);
        } else if (v.image) {
          list.push(v.image);
        }
      });
    }

    // 4. Clean up paths, attach the backend server base URL, and filter out broken URLs
    const resolved = [...new Set(list)]
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
      .filter(Boolean)
      .filter(url => !brokenImages.has(url));

    // Limit to at most 3 images to avoid heavy/distracting hover loops
    return resolved.slice(0, 3);
  }, [product, isHovered, brokenImages]);

  // Cache-safeguard: If the image is already cached, it completes instantly before onLoad is bound.
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, [images, currentImgIndex]);

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

  const handleRemoveWishlistClick = useThrottledCallback((e) => {
    e.stopPropagation();
    onRemoveWishlist?.(product.id || product._id);
  }, 1000);

  const handleWishlistClick = useThrottledCallback((e) => {
    e.stopPropagation();
    const targetId = product.id || product._id;
    if (isWishlisted) {
      onRemoveWishlist?.(targetId);
    } else {
      onWishlist?.(product);
    }
  }, 1000);

  const handleAddToCartClick = useThrottledCallback((e) => {
    e.stopPropagation();
    if (product?.customizeProduct === 'Yes') {
      toast.info('Please provide customization (upload image or text) before adding to cart.');
      const targetId = product.id || product._id;
      navigate(`/customizedProductDetail/${targetId}`, { state: { product } });
      return;
    }
    onAddToCart?.(product);
  }, 1000);

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
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-150 via-gray-200 to-gray-150 animate-pulse flex items-center justify-center z-5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Loading...</span>
              </div>
            )}
            <img 
              ref={imgRef}
              src={images[currentImgIndex]} 
              alt={product.title} 
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain group-hover:scale-105 transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={(e) => {
                setImageLoaded(true);
                const failedUrl = images[currentImgIndex];
                if (failedUrl) {
                  setBrokenImages(prev => {
                    const next = new Set(prev);
                    next.add(failedUrl);
                    return next;
                  });
                }
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center text-gray-400 font-sans text-center">
            <span className="text-sm font-medium">📷 Image Unavailable</span>
          </div>
        )}
        
       

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200/80 pointer-events-none z-10"></div>
        
        {/* Wishlist Actions Button */}
        {variant === "wishlist" ? (
          <button
            onClick={handleRemoveWishlistClick}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow border border-gray-100 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 z-10 cursor-pointer transition-all duration-200"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={handleWishlistClick}
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
    {[...Array(5)].map((_, i) => {
      // 1. Get the actual array length
      const totalReviews = product.reviewList?.length || 0;
      
      // 2. Calculate the live rating dynamically from the database array
      const liveRating = totalReviews > 0 
        ? product.reviewList.reduce((acc, item) => (item.rating || 0) + acc, 0) / totalReviews 
        : 0;

      // 3. Determine if this specific star should fill up
      const isFilled = liveRating > 0 && i < Math.floor(liveRating);
      
      return (
        <Star 
          key={i} 
          size={13} 
          fill={isFilled ? "currentColor" : "none"} 
          strokeWidth={isFilled ? 0 : 1.5} 
          className={isFilled ? "" : "text-gray-300 dark:text-gray-600"} 
        />
      );
    })}
  </div>
  <span className="text-gray-500 text-[12px] ml-1 truncate">
    ({product.reviewList?.length || 0})
  </span>
</div>

        
        {product.price !== null && product.price !== undefined && (
          <div className="mt-auto pt-0.5">
            <button 
              onClick={handleAddToCartClick}
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