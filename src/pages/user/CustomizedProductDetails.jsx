import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ShoppingBag, Star, ChevronUp, Share2, Plus, Minus, Upload, Eye, Type, CheckCircle, Play, SkipBack, SkipForward } from 'lucide-react';
import { toast } from '../../components/toast';

// Swiper imports for carousels
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { getProductByIdAPI } from '../../api/productApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const getImageURL = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  return `${BACKEND_URL}/${path.replace(/^\//, '')}`;
};

const CustomizedProductDetails = ({ onAddToCart, addToWishlist, wishlist = [], removeFromWishlist }) => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Color Mapping Configurations matching your branding requirements
  const colors = {
    primary: 'bg-[#001E3C] hover:bg-[#003147] text-white border-[#001E3C]',
    primaryText: 'text-[#001E3C]',
    secondary: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500',
    customizeBtn: 'bg-slate-500 hover:bg-slate-600 text-white'
  };

  const incomingProduct = location.state?.product;
  const [loadedProduct, setLoadedProduct] = useState(incomingProduct || null);
  const [loading, setLoading] = useState(!incomingProduct);

  useEffect(() => {
    if (incomingProduct) {
      setLoadedProduct(incomingProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductByIdAPI(productId);
        if (res && res.success && res.data) {
          setLoadedProduct(res.data);
        } else if (res && res.data) {
          setLoadedProduct(res.data);
        } else if (res) {
          setLoadedProduct(res);
        }
      } catch (err) {
        console.error("Error fetching customized product details dynamically:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, incomingProduct]);

  const product = useMemo(() => {
    const raw = loadedProduct || {
      id: productId || 1,
      title: "SNAP ART Customized Photo and Song Spotify Frame",
      price: 500,
      originalPrice: 550,
      rating: 4.0,
      reviews: 21,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&h=800&q=80",
      customizeProduct: "Yes",
      customizationType: "Both",
      warranty: "1 year Warranty",
      returnPolicy: "3 Days",
      deliveryMode: "Home Delivery Available Across Regions",
      variants: []
    };
    const firstVar = Array.isArray(raw.variants) ? raw.variants[0] : null;
    const defaultWeight = firstVar ? (firstVar.weight || 0) : (raw.weight || 0);
    const defaultPrice = firstVar ? (firstVar.price || 0) : (raw.price || 0);
    const defaultOriginalPrice = firstVar ? (firstVar.originalPrice || 0) : (raw.originalPrice || 0);
    return {
      id: raw._id?.$oid || raw._id || raw.id,
      title: raw.title || raw.name || '',
      rating: raw.rating ?? 5,
      reviews: raw.reviews || 0,
      image: raw.image || (raw.images?.[0] || ''),
      images: raw.images || (raw.image ? [raw.image] : []),
      customizeProduct: raw.customizeProduct || 'Yes',
      customizationType: raw.customizationType || 'Both',
      detailedDescription: raw.detailedDescription || raw.description || '',
      warranty: raw.warranty || '',
      returnPolicy: raw.returnPolicy || 'Select Return Days',
      deliveryMode: raw.deliveryMode || '',
      isActive: raw.isActive !== false,
      price: defaultPrice,
      originalPrice: defaultOriginalPrice,
      weight: defaultWeight,
      category: typeof raw.category === 'object' && raw.category?.name
        ? raw.category.name 
        : (raw.category || 'Catalog'),
      variants: Array.isArray(raw.variants) ? raw.variants : []
    };
  }, [loadedProduct, productId]);

  // ── Variant selection state ──
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // Auto-select first in-stock variant (or first variant if all out of stock)
  useEffect(() => {
    if (product.variants.length > 0) {
      const firstInStock = product.variants.find(v => v.stock > 0);
      setSelectedVariantId((firstInStock || product.variants[0]).id);
    }
  }, [product.variants]);

  const selectedVariant = useMemo(() => {
    return product.variants.find(v => v.id === selectedVariantId) || product.variants[0] || null;
  }, [product.variants, selectedVariantId]);

  // Derive price / originalPrice / discount / stock / images from selected variant
  const activePrice = selectedVariant?.price ?? 0;
  const activeOriginalPrice = selectedVariant?.originalPrice ?? activePrice;
  const activeDiscount = activeOriginalPrice > activePrice
    ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
    : 0;
  const activeStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = activeStock === 0;

  // Collect unique attribute keys across all variants
  const attributeKeys = useMemo(() => {
    const keys = new Set();
    product.variants.forEach(v => Object.keys(v.attributes || {}).forEach(k => keys.add(k)));
    return [...keys];
  }, [product.variants]);

  // For each attribute key, get unique values
  const attributeOptions = useMemo(() => {
    const map = {};
    attributeKeys.forEach(key => {
      map[key] = [...new Set(product.variants.map(v => v.attributes?.[key]).filter(Boolean))];
    });
    return map;
  }, [attributeKeys, product.variants]);

  // Clicking an attribute value → find the best matching variant
  const handleAttributeSelect = (key, value) => {
    const current = selectedVariant?.attributes || {};
    const desired = { ...current, [key]: value };
    // Find exact match first
    let match = product.variants.find(v =>
      Object.entries(desired).every(([k, val]) => v.attributes?.[k] === val)
    );
    // Fallback: match just the clicked attribute
    if (!match) {
      match = product.variants.find(v => v.attributes?.[key] === value);
    }
    if (match) setSelectedVariantId(match.id);
  };

  // Is a specific attribute value available (has stock) with current selections?
  const isAttrValueAvailable = (key, value) => {
    const current = selectedVariant?.attributes || {};
    const desired = { ...current, [key]: value };
    return product.variants.some(v =>
      Object.entries(desired).every(([k, val]) => v.attributes?.[k] === val) && v.stock > 0
    );
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [customImageURL, setCustomImageURL] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [activePreviewImage]);

  const [swiperRef, setSwiperRef] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTextInputPanel, setShowTextInputPanel] = useState(false);
  const [customUserText, setCustomUserText] = useState('');

  // Image adjust variables
  const [imageFit, setImageFit] = useState('contain'); // 'cover' or 'contain'
  const [imageScale, setImageScale] = useState(1.0);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);

  // Zoom Transform Setup (In-container bounds constraint)
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const containerRef = useRef(null);

  // Synchronize zoom style when user adjusts the manual sliders
  useEffect(() => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: `scale(${imageScale}) translate(${imageX}px, ${imageY}px)`
    });
  }, [imageScale, imageX, imageY]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (customImageURL) {
        URL.revokeObjectURL(customImageURL);
      }
    };
  }, [customImageURL]);

  const productGalleryThumbnails = useMemo(() => {
    const list = [];
    if (customImageURL) list.push(customImageURL);
    // Prefer selected variant images
    const variantImages = selectedVariant?.images?.length
      ? selectedVariant.images
      : selectedVariant?.image
        ? [selectedVariant.image]
        : [];
    if (variantImages.length > 0) {
      variantImages.forEach(img => { if (img) list.push(getImageURL(img)); });
    } else {
      // Fallback to product-level image
      if (product.image) list.push(getImageURL(product.image));
      (product.images || []).forEach(img => {
        const url = getImageURL(img);
        if (img && !list.includes(url)) list.push(url);
      });
    }
    return list;
  }, [customImageURL, selectedVariant, product.image, product.images]);

  const activePreviewImage = productGalleryThumbnails[activeImageIndex];

  // Synchronize swiper when activeImageIndex changes
  useEffect(() => {
    if (swiperRef) {
      swiperRef.slideTo(activeImageIndex);
    }
  }, [activeImageIndex, swiperRef]);

  const RELATED_PRODUCTS_MOCK = [
    { id: 101, title: "Glass Photo", price: 540, originalPrice: 550, image: product.image },
    { id: 102, title: "The Playlist", price: 540, originalPrice: 550, image: product.image },
    { id: 103, title: "Glass Photo", price: 544, originalPrice: 666, image: product.image },
    { id: 104, title: "The Playlist", price: 540, originalPrice: 550, image: product.image },
  ];

  useEffect(() => {
    const checkScrollHeight = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScrollHeight);
    return () => window.removeEventListener('scroll', checkScrollHeight);
  }, []);

  const handleFileChangeAction = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);

      if (customImageURL) {
        URL.revokeObjectURL(customImageURL);
      }

      const url = URL.createObjectURL(file);
      setCustomImageURL(url);
      setActiveImageIndex(0);
    }
  };

  const handleMouseMoveZoom = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: `scale(${imageScale * 2.2}) translate(${imageX}px, ${imageY}px)`
    });
  };

  const handleMouseLeaveZoom = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: `scale(${imageScale}) translate(${imageX}px, ${imageY}px)`
    });
  };

  const isWishlisted = useMemo(() => {
    return wishlist.some(item => item.id === product?.id);
  }, [wishlist, product?.id]);

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      if (removeFromWishlist) removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      if (addToWishlist) addToWishlist(product);
      toast.success("Added to wishlist!");
    }
  };

  const validateCustomization = () => {
    if (product.customizeProduct !== 'Yes') return true;

    if (product.customizationType === 'Text' || product.customizationType === 'Both') {
      if (!customUserText.trim()) {
        toast.error("Please enter your custom text inscription.");
        return false;
      }
    }
    if (product.customizationType === 'Image' || product.customizationType === 'Both') {
      if (!customImageURL) {
        toast.error("Please upload your custom design or photo.");
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!validateCustomization()) return;

    if (onAddToCart) {
      onAddToCart({
        ...product,
        price: activePrice || product.price,
        originalPrice: activeOriginalPrice || product.originalPrice,
        weight: selectedVariant ? (selectedVariant.weight || 0) : product.weight,
        quantity: quantity,
        customization: {
          text: customUserText,
          image: customImageURL
        }
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!validateCustomization()) return;

    navigate('/checkout', {
      state: {
        directPurchase: true,
        items: [
          {
            ...product,
            price: activePrice || product.price,
            originalPrice: activeOriginalPrice || product.originalPrice,
            weight: selectedVariant ? (selectedVariant.weight || 0) : product.weight,
            quantity: quantity,
            customization: {
              text: customUserText,
              image: customImageURL
            }
          }
        ]
      }
    });
  };


  return (
    <div className="w-full antialiased text-gray-800 selection:bg-gray-200 min-w-0 relative">
      
      {/* Breadcrumbs */}
      <div className="max-w-[2500px] mx-auto px-4 mt-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium flex-wrap">
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <span className="text-gray-300">/</span>
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/customized')}>Customized Products</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">{product.title}</span>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start max-w-[2500px] mx-auto relative px-4 mt-4">        
        {/* Left Column Image Layout: Swiper when <= 638px, Grid Desk layout when larger */}
        <div className="col-span-1 md:col-span-7 w-full min-w-0 relative">        
          {/* Mobile Swiper: Targets screens 638px and below exclusively */}
          <div className="block min-[639px]:hidden w-full pb-8">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={10}
              slidesPerView={1}
              onSwiper={setSwiperRef}
              onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
              className="product-swiper w-full aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
            >
              {productGalleryThumbnails.map((imgUrl, idx) => (
                <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={imgUrl} 
                    alt={`Product Slide ${idx}`} 
                    className="w-full h-full object-cover select-none" 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Desktop Matrix Side Thumbnails + Framed Zoom Display: Visible above 638px */}
          <div className="hidden min-[639px]:flex flex-row gap-3 w-full">
            <div className="flex flex-col gap-2 flex-shrink-0 w-12 sm:w-16 md:w-20">
              {productGalleryThumbnails.map((thumbUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square w-full rounded border overflow-hidden cursor-pointer bg-gray-50 transition-all ${
                    activeImageIndex === idx ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={thumbUrl} 
                    alt="Gallery Thumb" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>

            <div 
              ref={containerRef}
              onMouseMove={handleMouseMoveZoom}
              onMouseLeave={handleMouseLeaveZoom}
              className="flex-grow aspect-square border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-zoom-in"
            >
              <>
                {!mainImageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-150 via-gray-200 to-gray-150 animate-pulse flex items-center justify-center z-5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
                  </div>
                )}
                <img 
                  src={activePreviewImage} 
                  alt={product.title} 
                  style={{
                    ...zoomStyle,
                    objectFit: imageFit
                  }}
                  onLoad={() => setMainImageLoaded(true)}
                  className={`w-full h-full transition-all duration-300 ease-out pointer-events-none select-none ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <button className="absolute top-3 right-3 p-2 bg-white/90 text-gray-700 rounded-full shadow border border-gray-100 pointer-events-none z-10">
                  <Eye size={16} />
                </button>
              </>
            </div>
          </div>
        </div>

        {/* Right Details Panel Dashboard */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-2 w-full min-w-0 relative">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
              {product.title}
            </h1>
            
            <div className="flex items-baseline gap-2 mt-3 flex-wrap">
              {activeOriginalPrice > activePrice && (
                <span className="text-xs sm:text-sm text-gray-500">
                  MRP <span className="line-through">₹{activeOriginalPrice.toLocaleString('en-IN')}</span>
                </span>
              )}
              <span className={`text-lg sm:text-xl font-bold ${colors.primaryText}`}>₹{activePrice.toLocaleString('en-IN')}</span>
              {activeDiscount > 0 && (
                <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {activeDiscount}% Off
                </span>
              )}
            </div>
            {/* Stock badge */}
            <div className="mt-1">
              {product.isActive === false ? (
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Product Inactive / Unavailable
                </span>
              ) : isOutOfStock ? (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">In Stock ({activeStock} units)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <div className="flex text-amber-400 items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">({product.reviews})</span>
            </div>
          </div>

          {/* Variant Attribute Selectors */}
          {product.variants.length > 0 && attributeKeys.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-gray-100 ">
              {attributeKeys.map(key => {
                const isColorKey = key.toLowerCase() === 'color';
                return (
                  <div key={key}>
                    {/* Label row */}
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                      {selectedVariant?.attributes?.[key] && (
                        <span className="ml-1 font-normal text-gray-500">
                          {selectedVariant.attributes[key]}
                        </span>
                      )}
                    </p>

                    {isColorKey ? (
                      /* ── Color circles ── */
                      <div className="flex flex-wrap gap-3">
                        {attributeOptions[key]?.map(val => {
                          const isSelected = selectedVariant?.attributes?.[key] === val;
                          const available = product.variants.some(
                            v => v.attributes?.[key] === val
                          );
                          return (
                            <button
                              key={val}
                              title={val}
                              onClick={() => handleAttributeSelect(key, val)}
                              disabled={!available}
                              style={{ backgroundColor: val.toLowerCase() }}
                              className={`w-9 h-9 rounded-full transition-all focus:outline-none ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-gray-800 scale-110 shadow-md'
                                  : available
                                    ? 'ring-1 ring-gray-300 hover:scale-110 hover:ring-gray-500'
                                    : 'opacity-30 cursor-not-allowed'
                              }`}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      /* ── Pill chips for size / other attributes ── */
                      <div className="flex flex-wrap gap-2">
                        {attributeOptions[key]?.map(val => {
                          const isSelected = selectedVariant?.attributes?.[key] === val;
                          const available = product.variants.some(
                            v => v.attributes?.[key] === val
                          );
                          return (
                            <button
                              key={val}
                              onClick={() => handleAttributeSelect(key, val)}
                              disabled={!available}
                              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                isSelected
                                  ? 'border-[#001E3C] bg-[#001E3C] text-white shadow-sm'
                                  : available
                                    ? 'border-gray-300 text-gray-700 hover:border-gray-600 bg-white'
                                    : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2.5 text-xs font-medium text-gray-600 border-t border-b border-gray-100 ">
            {product.warranty && (
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 p-1 rounded-sm">🛡️</span>
                <span>{product.warranty}</span>
              </div>
            )}
            {product.returnPolicy && product.returnPolicy !== 'Select Return Days' && (
              <div className="flex items-center gap-2">
                <span className="bg-purple-50 text-purple-700 p-1 rounded-sm">🔄</span>
                <span>
                  {product.returnPolicy === 'No Return Policy' 
                    ? 'No Return Policy' 
                    : `${product.returnPolicy} Replacement Policy Window`}
                </span>
              </div>
            )}
        
          </div>

          <div className="pbflex flex-wrap gap-3 items-center w-full border-b border-gray-100 ">
            <div className="flex flex-wrap items-center gap-3">
              <div className={`flex items-center border border-gray-300 rounded-md overflow-hidden h-10 sm:h-11 w-28 sm:w-32 shadow-sm ${product.isActive === false ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.isActive === false}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
                >
                  -
                </button>
                <div className="w-1/3 h-full flex items-center justify-center border-x border-gray-300 font-bold text-sm bg-gray-50 text-gray-800">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.isActive === false}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
                >
                  +
                </button>
              </div>
            
              <button 
                onClick={handleWishlistToggle}
                className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group"
              >
                <Heart 
                  size={16} 
                  fill={isWishlisted ? "#EF4444" : "none"} 
                  className={isWishlisted ? "text-red-500" : "text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-colors"} 
                />
              </button>
              <button className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
                <Share2 size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-auto">
            <button 
              onClick={handleAddToCart}
              disabled={product.isActive === false || isOutOfStock}
              className={`flex-1 border-2 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 shadow-sm transition-colors ${
                product.isActive === false || isOutOfStock
                  ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'border-primary text-primary hover:bg-primary/5'
              }`}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.isActive === false || isOutOfStock}
              className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 shadow-md transition-opacity ${
                product.isActive === false || isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              <ShoppingBag size={18} /> {product.isActive === false ? 'Inactive' : isOutOfStock ? 'Unavailable' : 'Buy Now'}
            </button>
          </div>

          {product.customizeProduct === 'Yes' && (
            <div className="w-full border border-gray-200/80 rounded-lg p-4 bg-gray-50/30 flex flex-col gap-4 mt-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-wide">Customize This Product</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {product.customizationType === 'Both' && "Provide custom text and/or image specifications"}
                  {product.customizationType === 'Image' && "Upload custom image layout specifications"}
                  {product.customizationType === 'Text' && "Provide custom text inscription details"}
                </p>
              </div>

              {/* Show Image upload controls if type is Image or Both */}
              {(product.customizationType === 'Image' || product.customizationType === 'Both') && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Upload size={12} /> Custom Design/Photo:
                  </span>
                  <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center border border-gray-300 rounded bg-white overflow-hidden text-xs shadow-sm">
                    <label className="bg-gray-100 hover:bg-gray-200 border-r border-gray-300 text-gray-700 px-4 py-2.5 font-semibold text-center cursor-pointer select-none transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                      Choose File
                      <input type="file" accept="image/*" onChange={handleFileChangeAction} className="hidden" />
                    </label>
                    <div className="px-3 py-2 text-gray-500 truncate flex-grow bg-white min-w-0">
                      {selectedImageFile ? selectedImageFile.name : "No file chosen"}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Max file size constraints: 5MB (JPG, PNG, GIF)</p>
                </div>
              )}

              {/* Show Text area controls if type is Text or Both */}
              {(product.customizationType === 'Text' || product.customizationType === 'Both') && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Type size={14} />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Custom Text Inscription</h4>
                  </div>
                  <textarea
                    value={customUserText}
                    onChange={(e) => setCustomUserText(e.target.value)}
                    placeholder="Enter customized names, songs, dedications, dates, or custom Spotify text tracks..."
                    rows={3}
                    className="w-full p-2.5 text-xs text-gray-800 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-400 shadow-sm"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Maximum Character Capacity: 250</span>
                    {customUserText.trim().length > 0 && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5 animate-pulse">
                        <CheckCircle size={11} /> Saved to Configuration
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Info Specifications Tabs */}
      <div className="w-full max-w-[2500px] mx-auto px-4 mt-6">
        <div className="border-b border-gray-200 flex items-center">
          <button className="border-b-2 border-blue-900 px-4 py-2.5 text-xs font-bold uppercase text-blue-900 tracking-wider">
            Additional Info Specification
          </button>
        </div>
        <div className="py-5 text-xs text-gray-600 leading-relaxed max-w-4xl border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
            <span className="font-bold text-gray-900 text-sm sm:col-span-1">Description:</span>
            <span className="sm:col-span-3 text-gray-600 text-xs font-medium">
              {product.detailedDescription || `${product.title} Perfect design payload for birthday celebrations, valentine memory books, wedding anniversary milestones, or customized gift tokens for family and friends.`}
            </span>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="w-full max-w-[2500px] mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-blue-600">
          Related Products
        </h2>

        {/* 1. Mobile & Tablet Swiper version: Active exclusively below 1010px */}
        <div className="block min-[1010px]:hidden w-full">
          <Swiper
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 1.25 },
              440: { slidesPerView: 1.6 },
              550: { slidesPerView: 2.2 },
              740: { slidesPerView: 3.2 },
              900: { slidesPerView: 3.8 }
            }}
            className="w-full related-products-swiper"
          >
            {RELATED_PRODUCTS_MOCK.map((relProduct) => (
              <SwiperSlide key={relProduct.id} className="flex justify-center !h-auto">
                {/* Fixed operational sizing constraint prevents cards from ballooning out of scale */}
                <div className="border border-gray-100 rounded bg-white flex flex-col h-full w-full max-w-[280px] min-w-0 overflow-hidden relative mx-auto">
                  
                  {/* Main Card Media Wrapper */}
                  <div className="aspect-square bg-gray-50/50 relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={relProduct.image} 
                      alt={relProduct.title} 
                      className="w-full h-full object-cover" 
                    />
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow border border-gray-100 text-gray-400">
                      <Heart size={14} />
                    </button>
                  </div>
                  
                  {/* Card Text Meta Body */}
                  <div className="p-3 flex flex-col gap-1 flex-1 min-w-0 bg-white">
                    <h4 className="text-xs font-medium text-gray-800 truncate">
                      {relProduct.title}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-auto">
                      <span className={`text-xs font-bold ${colors.primaryText}`}>
                        ₹{relProduct.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{relProduct.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 2. Desktop Single Row Layout: Fixed at 4 elements horizontally, active from 1010px and up */}
        <div className="hidden min-[1010px]:grid grid-cols-4 gap-4 w-full min-w-0 items-stretch">
          {RELATED_PRODUCTS_MOCK.map((relProduct) => (
            <div 
              key={relProduct.id}
              className="border border-gray-100 rounded bg-white hover:shadow-md transition-shadow flex flex-col h-full min-w-0 overflow-hidden relative group cursor-pointer"
            >
              <div className="aspect-square bg-gray-50/50 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={relProduct.image} 
                  alt={relProduct.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-102" 
                />
                <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow border border-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={14} />
                </button>
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1 min-w-0 bg-white">
                <h4 className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-500 transition-colors">
                  {relProduct.title}
                </h4>
                <div className="flex items-baseline gap-1.5 mt-auto">
                  <span className={`text-xs font-bold ${colors.primaryText}`}>₹{relProduct.price.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 line-through">₹{relProduct.originalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to top scroll button element */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 bg-slate-900 text-white p-2 rounded shadow-lg hover:bg-blue-600 transition-colors z-50 transition-opacity duration-300"
        >
          <ChevronUp size={16} />
        </button>
      )}

    </div>
  );
};

export default CustomizedProductDetails;