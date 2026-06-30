import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import useThrottledCallback from '../../hooks/useThrottledCallback';
import { ShoppingCart, Heart, Star, Share2, ShoppingBag, Eye, Plus } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from '../../components/toast';

import "swiper/css";
import "swiper/css/pagination";
import ProductCard from '../../components/ProductCard';
import { getProductByIdAPI, getProductsAPI } from '../../api/productApi';
import { getCategoriesAPI } from '../../api/categoryApi';
import { getCombosAPI } from '../../api/comboApi';

const ProductDetail = ({ onAddToCart, addToWishlist, wishlist = [], removeFromWishlist }) => {
  const { subcategoryId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedColor, setSelectedColor] = useState('Default');
  const [selectedSize, setSelectedSize] = useState('Default');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const mainImgRef = useRef(null);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [activeImageIndex]);

  // Base backend URL helper function to cleanly resolve image streams
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image+Available";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`;
  };


  const handleShare = async () => {
    // Check if the browser supports the Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this out!',
          text: 'Here is some cool content I wanted to share with you.',
          url: window.location.href, 
        });
        console.log('Successfully shared');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback behavior for browsers/devices that don't support it (like older desktop browsers)
      alert('Native sharing is not supported on this browser. Copying URL to clipboard instead!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // --- DYNAMIC DATA INTEGRATION LAYER ---
  const incomingProduct = location.state?.product;
  const [loadedProduct, setLoadedProduct] = useState(incomingProduct || null);
  const [loading, setLoading] = useState(!incomingProduct);
  const [combos, setCombos] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await getCombosAPI();
        if (res && res.success) {
          setCombos(res.data || []);
        }
      } catch (err) {
        console.error("Error loading combo packs:", err);
      }
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    if (!loadedProduct) return;
    const fetchRelatedProducts = async () => {
      try {
        const res = await getProductsAPI();
        if (res && res.success && Array.isArray(res.data)) {
          const currentId = loadedProduct._id || loadedProduct.id;
          const currentCat = typeof loadedProduct.category === 'object' 
            ? loadedProduct.category._id || loadedProduct.category.id || loadedProduct.category.name 
            : loadedProduct.category;
          const currentSubCat = typeof loadedProduct.subcategory === 'object'
            ? loadedProduct.subcategory._id || loadedProduct.subcategory.id || loadedProduct.subcategory.name
            : loadedProduct.subcategory;

          const otherProducts = res.data.filter(p => {
            const pId = p._id || p.id;
            return pId !== currentId && p.status !== false;
          });

          const sameSubcategory = [];
          const sameCategoryOnly = [];

          otherProducts.forEach(p => {
            const pCat = typeof p.category === 'object' 
              ? p.category._id || p.category.id || p.category.name 
              : p.category;
            const pSubCat = typeof p.subcategory === 'object'
              ? p.subcategory._id || p.subcategory.id || p.subcategory.name
              : p.subcategory;

            if (currentSubCat && pSubCat === currentSubCat) {
              sameSubcategory.push(p);
            } else if (currentCat && pCat === currentCat) {
              sameCategoryOnly.push(p);
            }
          });

          setRelatedProducts([...sameSubcategory, ...sameCategoryOnly]);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };
    fetchRelatedProducts();
  }, [loadedProduct]);

  const [categoryName, setCategoryName] = useState(
    typeof incomingProduct?.category === 'object' && incomingProduct?.category?.name
      ? incomingProduct.category.name
      : (typeof incomingProduct?.category === 'string' ? incomingProduct.category : 'Shop')
  );
  const [subcategoryName, setSubcategoryName] = useState(
    typeof incomingProduct?.subcategory === 'object' && incomingProduct?.subcategory?.name
      ? incomingProduct.subcategory.name
      : (typeof incomingProduct?.subcategory === 'string' ? incomingProduct.subcategory : '')
  );

  // Sync loadedProduct state if URL id or incomingProduct changes
  useEffect(() => {
    if (incomingProduct) {
      setLoadedProduct(incomingProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductByIdAPI(id);
        if (res && res.success && res.data) {
          setLoadedProduct(res.data);
        } else if (res && res.data) {
          setLoadedProduct(res.data);
        } else if (res) {
          setLoadedProduct(res);
        }
      } catch (err) {
        console.error("Error fetching product details dynamically:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, incomingProduct]);

  // Lookup subcategory and category names for breadcrumbs
  useEffect(() => {
    if (!subcategoryId) return;
    const fetchNames = async () => {
      try {
        const catRes = await getCategoriesAPI();
        if (catRes && catRes.success && Array.isArray(catRes.data)) {
          for (const cat of catRes.data) {
            const matchedSub = (cat.subcategories || []).find(
              sub => (sub._id || sub.id) === subcategoryId
            );
            if (matchedSub) {
              setCategoryName(cat.name);
              setSubcategoryName(matchedSub.name || matchedSub);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error looking up names for breadcrumbs:", err);
      }
    };
    fetchNames();
  }, [subcategoryId]);

  // Pure data parsing direct from Mongoose model parameters
  const product = useMemo(() => {
  if (!loadedProduct) return null;

  const variants = loadedProduct.variants || [];

  // --- 1. SET UP THE BACKUP IMAGE GALLERY ---
  // If no variant is selected yet, merge every variant image together 
  // so the user has a full gallery to browse out-of-the-box.
  let dynamicImages = [];
  if (variants.length > 0) {
    dynamicImages = variants.flatMap(v => v.images || (v.image ? [v.image] : []));
  }
  // If variants are empty, fall back to the main product banner image
  if (dynamicImages.length === 0 && loadedProduct.image) {
    dynamicImages = [loadedProduct.image];
  }

  // --- 2. SWITCH TO VARIANT-SPECIFIC IMAGES ---
  // If a specific color variant is active, throw away the backup gallery
  // and load ONLY the images belonging to this specific color.
  if (variants.length > 0 && selectedColor && selectedColor !== 'Default') {
    const matchingVariant = variants.find(v => {
      // Handles both plain strings ("Orange") and piped strings ("Green|#10B981")
      const variantColorName = v.attributes?.color?.includes('|')
        ? v.attributes.color.split('|')[0]
        : v.attributes?.color;

      const activeColorName = selectedColor.includes('|')
        ? selectedColor.split('|')[0]
        : selectedColor;

      return variantColorName === activeColorName;
    });

    if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
      dynamicImages = matchingVariant.images;
    }
  }

  // --- 3. EXTRACT VARIANT UNIQUE VALUES FOR PRICING & STOCK ---
  const activeVariant = variants.find(v => {
    const vColor = v.attributes?.color?.includes('|') ? v.attributes.color.split('|')[0] : v.attributes?.color;
    const aColor = selectedColor.includes('|') ? selectedColor.split('|')[0] : selectedColor;
    return vColor === aColor && v.attributes?.size === selectedSize;
  }) || variants.find(v => {
    const vColor = v.attributes?.color?.includes('|') ? v.attributes.color.split('|')[0] : v.attributes?.color;
    const aColor = selectedColor.includes('|') ? selectedColor.split('|')[0] : selectedColor;
    return vColor === aColor;
  }) || variants[0];

  // --- 4. ASSEMBLE DYNAMIC ATTRIBUTE LISTS ---
  const colors = loadedProduct.colors || (variants.length > 0
    ? [...new Set(variants.map(v => v.attributes?.color))].filter(Boolean).map(c => ({ name: c, hex: c }))
    : []);

  const sizes = loadedProduct.sizes || (variants.length > 0
    ? [...new Set(variants.map(v => v.attributes?.size))].filter(Boolean)
    : []);

  return {
    id: loadedProduct._id || loadedProduct.id,
    brand: loadedProduct.brand || '',
    title: loadedProduct.title || loadedProduct.name || 'Product Details',
    category: typeof loadedProduct.category === 'object' && loadedProduct.category?.name
      ? loadedProduct.category.name 
      : (loadedProduct.category || 'Catalog'),
    price: activeVariant ? activeVariant.price : (loadedProduct.price || 0),
    originalPrice: activeVariant ? activeVariant.originalPrice : (loadedProduct.originalPrice || 0),
    weight: activeVariant ? (activeVariant.weight || 0) : (loadedProduct.weight || 0),
    discount: loadedProduct.discount || 0,
    rating: loadedProduct.rating ?? 5,
    reviews: loadedProduct.reviews || 0,
    images: dynamicImages, // Handled precisely above
    colors,
    sizes,
    inStock: activeVariant ? activeVariant.stock > 0 : (loadedProduct.inStock ?? true),
    isActive: loadedProduct.isActive !== false,
    warranty: loadedProduct.warranty || '',
    returnPolicy: loadedProduct.returnPolicy || 'Select Return Days',
    deliveryMode: loadedProduct.deliveryMode || ''
  };
}, [loadedProduct, selectedColor, selectedSize]);

  // Cache-safeguard: If the image is already cached, it completes instantly before onLoad is bound.
  useEffect(() => {
    if (mainImgRef.current && mainImgRef.current.complete) {
      setMainImageLoaded(true);
    }
  }, [activeImageIndex, product]);


  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

// Sync selection instances ONLY when swapping to a completely different product ID
useEffect(() => {
  if (loadedProduct) {
    const variants = loadedProduct.variants || [];
    
    if (variants.length > 0) {
      // Safely default to the exact raw string representation within MongoDB
      const firstVariantColor = variants[0].attributes?.color;
      const firstVariantSize = variants[0].attributes?.size;
      
      if (firstVariantColor) setSelectedColor(firstVariantColor);
      if (firstVariantSize) setSelectedSize(firstVariantSize);
    } else {
      setSelectedColor('Default');
      setSelectedSize('Default');
    }
    
    setActiveImageIndex(0);
    setQuantity(1);
  }
}, [id, loadedProduct]); //  FIXED: Watch loadedProduct/id, NOT the derived memoized product object

  // Find matching active combo from database containing this product
  const matchedCombo = useMemo(() => {
    if (!product || combos.length === 0) return null;
    const currentProdId = product.id;
    return combos.find(c => 
      c.status !== false && 
      c.selectedItemIds?.some(item => (item._id || item.id || item) === currentProdId)
    );
  }, [combos, product]);

  // --- INTERACTIVE DATA FOR COMBO PRODUCT INTEGRATION ---
  const comboData = useMemo(() => {
    if (!product || !matchedCombo) return null;
    
    const totalOriginalSum = matchedCombo.totalPrice || matchedCombo.selectedItemIds.reduce((acc, item) => acc + (item.variants?.[0]?.price || item.price || 0), 0);
    const offerPrice = matchedCombo.offerPrice || 0;
    const discountPercent = totalOriginalSum > offerPrice 
      ? Math.round(((totalOriginalSum - offerPrice) / totalOriginalSum) * 100)
      : 0;

    return {
      id: matchedCombo._id || matchedCombo.id,
      title: matchedCombo.name,
      discountPercent,
      category: matchedCombo.category || '',
      items: matchedCombo.selectedItemIds.map(item => {
        const isCurrent = (item._id || item.id) === product.id;
        return {
          id: item._id || item.id,
          title: isCurrent ? `${item.title} (${selectedColor} / ${selectedSize}) (This Item)` : item.title,
          price: item.variants?.[0]?.price || item.price || 0,
          image: item.image || '',
          weight: item.weight || 0,
          category: item.category || '',
          isCurrent
        };
      })
    };
  }, [product, matchedCombo, selectedColor, selectedSize]);

  const [selectedComboItemIds, setSelectedComboItemIds] = useState([]);

  useEffect(() => {
    if (comboData) {
      setSelectedComboItemIds(comboData.items.map(item => item.id));
    }
  }, [id, comboData]);

  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const containerRef = useRef(null);

  const handleMouseMoveZoom = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.2)' });
  };

  const handleMouseLeaveZoom = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const isWishlisted = useMemo(() => {
    return wishlist.some(item => item.id === product?.id);
  }, [wishlist, product?.id]);

  const handleWishlistToggle = useThrottledCallback(() => {
    if (!product) return;
    if (isWishlisted) {
      if (removeFromWishlist) removeFromWishlist(product.id);
     
    } else {
      if (addToWishlist) addToWishlist(product);
     
    }
  }, 1000);

  const handleAddToCart = useThrottledCallback(() => {
    if (!product) return;
    if (onAddToCart) {
      onAddToCart({
        ...product,
        quantity: quantity,
        selectedOptions: {
          color: selectedColor,
          size: selectedSize
        }
      });
    }
  }, 1000);

  const handleBuyNow = useThrottledCallback(() => {
    if (!product) return;
    navigate('/checkout', {
      state: {
        directPurchase: true,
        items: [
          {
            ...product,
            quantity: quantity,
            selectedOptions: {
              color: selectedColor,
              size: selectedSize
            }
          } 
        ] 
      } 
    }); 
  }, 1000);

    

  const toggleComboItem = (itemId, isCurrent) => {
    if (isCurrent) return;
    if (selectedComboItemIds.includes(itemId)) {
      setSelectedComboItemIds(selectedComboItemIds.filter(i => i !== itemId));
    } else {
      setSelectedComboItemIds([...selectedComboItemIds, itemId]);
    }
  };

  const isFullComboSelected = selectedComboItemIds.length === (comboData?.items?.length || 0);
  const regularComboSum = (comboData?.items || [])
    .filter(item => selectedComboItemIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const finalComboPrice = isFullComboSelected 
    ? (matchedCombo?.offerPrice || Math.round(regularComboSum * (1 - (comboData?.discountPercent || 0) / 100))) 
    : regularComboSum;

  const totalComboSavings = regularComboSum - finalComboPrice;

  const handleAddBundleToCart = useThrottledCallback(() => {
    if (!comboData) return;
    const selectedItems = comboData.items.filter(item => selectedComboItemIds.includes(item.id));
    const bundleCartPayload = {
      id: isFullComboSelected ? comboData.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFullComboSelected ? comboData.title : "Custom Pack Bundle Deal",
      price: finalComboPrice,
      quantity: 1, 
      image: comboData.items[0].image, 
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      weight: selectedItems.reduce((sum, item) => sum + (item.weight || 0), 0),
      category: comboData.category || selectedItems[0]?.category || 'Catalog',
      includedProducts: selectedItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        weight: item.weight || 0,
        category: item.category || ''
      }))
    };
    console.log("Adding bundle to cart store:", bundleCartPayload);
    onAddToCart(bundleCartPayload);
    navigate('/cart');
  }, 1000);

  const handleAddBundleToBuy = useThrottledCallback(() => {
    if (!comboData) return;
    const selectedItems = comboData.items.filter(item => selectedComboItemIds.includes(item.id));
    const bundleCheckoutPayload = {
      id: isFullComboSelected ? comboData.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFullComboSelected ? comboData.title : "Custom Pack Bundle Deal",
      price: finalComboPrice,
      quantity: 1,
      image: comboData.items[0].image,
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      weight: selectedItems.reduce((sum, item) => sum + (item.weight || 0), 0),
      category: comboData.category || selectedItems[0]?.category || 'Catalog',
      includedProducts: selectedItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        weight: item.weight || 0,
        category: item.category || ''
      }))
    };
    navigate('/checkout', { state: { directPurchaseBundle: bundleCheckoutPayload } });
  }, 1000);


  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">No Product Data Found</h2>
        <p className="text-gray-500 text-sm mt-1 mb-4">Please return to the store catalog to select a product.</p>
        <Link to="/products" className="bg-primary text-white px-5 py-2 rounded-md font-bold text-sm shadow">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full font-sans mt-5">
      <div className="w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            {categoryName || "Shop"}
          </Link>
          {subcategoryId && subcategoryName && (
            <>
              <span className="text-gray-300">/</span>
              <Link 
                to={`/sub-category/${subcategoryId}`}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {subcategoryName}
              </Link>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">{product.title}</span>
        </div>

        {/* Product Media Gallery + Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
          {/* Left: Images */}
          <div className="w-full min-w-0">
            {/* Mobile Slider */}
            {product.images.length > 0 && (
              <div className="block sm:hidden">
                <Swiper
                  modules={[Pagination]}
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="product-swiper rounded-lg overflow-hidden border border-gray-200 aspect-square"
                >
                  {product.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative w-full h-full">
                        <img 
                          src={formatImageUrl(img)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=No+Image+Available"; }}
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
            
            {/* Desktop Gallery */}
            <div className="hidden sm:flex gap-3 lg:gap-4 w-full">
              <div className="flex flex-col gap-2 md:gap-3 w-16 md:w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-md border-2 shrink-0 ${
                      activeImageIndex === idx ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img 
                      src={formatImageUrl(img)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error"; }}
                    />
                  </button>
                ))}
              </div>
              
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMoveZoom}
                onMouseLeave={handleMouseLeaveZoom}
                className="flex-1 aspect-square relative overflow-hidden rounded-lg border border-gray-200 cursor-zoom-in bg-gray-50 flex items-center justify-center"
              >
                {product.images.length > 0 ? (
                  <>
                    {!mainImageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-150 via-gray-200 to-gray-150 animate-pulse flex items-center justify-center z-5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
                      </div>
                    )}
                    <img
                      ref={mainImgRef}
                      src={formatImageUrl(product.images[activeImageIndex] || product.images[0])}
                      alt={product.title}
                      style={zoomStyle}
                      onLoad={() => setMainImageLoaded(true)}
                      className={`w-full h-full object-cover transition-all duration-300 ease-out pointer-events-none select-none ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onError={(e) => {
                        setMainImageLoaded(true);
                        e.target.src = "https://via.placeholder.com/500?text=No+Image+Available";
                      }}
                    />
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">No Image Available</div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white/90 text-gray-700 rounded-full shadow border border-gray-100 pointer-events-none z-10">
                  <Eye size={16} />
                </button>
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold pointer-events-none z-10">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full min-w-0 flex flex-col gap-3">
            {product.brand && <span className="text-blue-600 font-bold text-xs sm:text-sm">{product.brand}</span>}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            
            {/* Ratings */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex text-[#ffc107]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                    strokeWidth={i < Math.floor(product.rating) ? 0 : 2}
                    className={`sm:w-4 sm:h-4 ${i >= Math.floor(product.rating) ? "text-gray-300" : ""}`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800 text-sm">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({product.reviews} Customer Reviews)</span>
            </div>

            <div className="text-sm space-y-1.5">
              <p><span className="font-bold text-gray-800">Category:</span> <span className="text-gray-600">{product.category}</span></p>
            </div>

            {/* Pricing Section */}
            <div className="flex flex-wrap items-baseline gap-2">
              {product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  MRP <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                </span>
              )}
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
              {product.discount > 0 && (
                <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {product.discount}% Off
                </span>
              )}
            </div>

            {/* Variants: Color */}
            {product.colors.length > 0 && (
              <div>
                <p className="font-bold text-gray-800 mb-3 text-sm">
                  Color: <span className="font-normal text-gray-600 ml-1">
                    {selectedColor.includes('|') ? selectedColor.split('|')[0] : selectedColor}
                  </span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map(color => {
                    const hasPipe = color.name?.includes('|');
                    const cleanName = hasPipe ? color.name.split('|')[0] : color.name;
                    const cleanHex = hasPipe ? color.name.split('|')[1] : (color.hex || '#CCCCCC');
                    const isSelected = selectedColor === color.name || cleanName === selectedColor;

                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={cleanName}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' 
                            : 'hover:scale-110 border border-gray-200'
                        }`}
                        style={{ backgroundColor: cleanHex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}          

            {/* Variants: Size */}
            {product.sizes.length > 0 && (
              <div>
                <p className="font-bold text-gray-800 mb-3 text-sm">Size: <span className="font-normal text-gray-600 ml-1">{selectedSize}</span></p>
                <div className="flex gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-bold border transition-colors shadow-sm ${
                        selectedSize === size ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {product.isActive === false ? (
                <div className="bg-rose-50 text-rose-700 px-3 py-2 rounded-md border border-rose-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Product Inactive / Temporarily Unavailable
                </div>
              ) : (
                <span className={product.inStock ? "text-green-600 font-bold text-sm tracking-wide" : "text-red-500 font-bold text-sm tracking-wide"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-medium text-gray-600 border-t border-b border-gray-100 py-3">
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

            {/* Quantity Controls */}
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
              <button 
                onClick={handleShare}
                className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group"
              >
                <Share2 size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 max-[408px]:grid-cols-1 gap-2 mt-auto w-full max-w-sm">
              <button 
                onClick={handleAddToCart}
                disabled={product.isActive === false || !product.inStock}
                className={`w-full border-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-bold flex justify-center items-center gap-1.5 transition-colors shadow-sm ${
                  product.isActive === false || !product.inStock
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary/5'
                }`}
              >
                <ShoppingCart size={15} /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.isActive === false || !product.inStock}
                className={`w-full py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-bold flex justify-center items-center gap-1.5 transition-opacity shadow-sm ${
                  product.isActive === false || !product.inStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                <ShoppingBag size={15} /> {product.isActive === false ? 'Inactive' : !product.inStock ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Specifications Block */}
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
                {loadedProduct?.detailedDescription || loadedProduct?.description || `${product.title} processing configuration metadata options.`}
              </span>
            </div>
          </div>
        </div>

        {/* Combo Pack Section */}
        {comboData && (
          <div className="w-full mt-10 bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <span className="bg-primary-100 text-green-700 text-xs font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                  Limited Time Bundle Offer
                </span>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 flex items-center gap-1.5">
                  Frequently Bought Together (Combo Deal)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Get an extra <span className="text-red-600 font-bold">{comboData.discountPercent}% OFF</span> on the entire setup when purchased collectively!
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              {/* Left Column Grid Items (Swiper Slider) */}
              <div className="flex-1 min-w-0 relative px-8 flex items-center bg-white border border-gray-150 rounded-xl p-4 shadow-2xs">
                {comboData.items.length > 0 && (
                  <>
                    <button className="combo-prev-btn absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                      <ChevronLeft size={18} className="text-gray-700" />
                    </button>
                    
                    <Swiper
                      modules={[Navigation]}
                      navigation={{
                        prevEl: '.combo-prev-btn',
                        nextEl: '.combo-next-btn',
                      }}
                      spaceBetween={16}
                      slidesPerView={4}
                      breakpoints={{
                        320: {
                          slidesPerView: 1.2,
                          spaceBetween: 10
                        },
                        480: {
                          slidesPerView: 2,
                          spaceBetween: 12
                        },
                        768: {
                          slidesPerView: 3,
                          spaceBetween: 14
                        },
                        1200: {
                          slidesPerView: 4,
                          spaceBetween: 16
                        }
                      }}
                      className="w-full h-full"
                    >
                      {comboData.items.map((item, idx) => (
                        <SwiperSlide key={item.id} className="py-1">
                          <div 
                            onClick={() => toggleComboItem(item.id, item.isCurrent)}
                            className={`w-full bg-white border rounded-xl p-3.5 flex flex-col items-center gap-3 transition-all relative ${
                              item.isCurrent ? 'cursor-default border-blue-400 ring-1 ring-blue-100' : 'cursor-pointer select-none'
                            } ${
                              selectedComboItemIds.includes(item.id) 
                                ? 'border-blue-500 shadow-xs' 
                                : 'opacity-50 border-gray-200 grayscale scale-95 hover:opacity-80'
                            }`}
                          >
                            <div className="absolute top-2 left-2 z-10 pointer-events-none">
                              <input 
                                type="checkbox" 
                                checked={selectedComboItemIds.includes(item.id)} 
                                readOnly
                                disabled={item.isCurrent}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-gray-300 cursor-pointer"
                              />
                            </div>

                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                              <img 
                                src={formatImageUrl(item.image)} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                              />
                            </div>

                            <div className="text-center min-w-0 w-full">
                              <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug h-8">
                                {item.title}
                              </h4>
                              <p className="text-sm font-black text-gray-900 mt-1">
                                ₹{item.price}
                              </p>
                            </div>

                            {/* Floating Plus bubble connecting items */}
                            {idx < comboData.items.length - 1 && (
                              <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-20 text-gray-400 bg-gray-100 p-1 rounded-full border-2 border-white shadow-xs pointer-events-none hidden sm:flex">
                                <Plus size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="combo-next-btn absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Right Summary Calculations Block */}
              <div className="w-full md:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm shrink-0">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                    Bundle Price Calculation
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Selected Items ({selectedComboItemIds.length}):</span>
                      <span className="font-medium text-gray-900">₹{regularComboSum}</span>
                    </div>
                    {isFullComboSelected ? (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Combo Promotion Pack Discount:</span>
                        <span>-{comboData.discountPercent}%</span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 text-[11px] text-amber-800 leading-normal">
                        💡 Select all components to qualify for the bundle discount structure.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm font-bold text-gray-800">Total Price:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-gray-900">₹{finalComboPrice}</span>
                      {totalComboSavings > 0 && (
                        <p className="text-[11px] font-bold text-green-600">Save ₹{totalComboSavings}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleAddBundleToCart}
                      className="w-full border border-gray-300 py-2 text-xs rounded-md font-bold hover:bg-gray-50 transition-colors"
                    >
                      Bundle to Cart
                    </button>
                    <button 
                      onClick={handleAddBundleToBuy}
                      className="w-full bg-blue-900 text-white py-2 text-xs rounded-md font-bold hover:opacity-90 transition-opacity"
                    >
                      Buy Bundle Set
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="w-full mt-12 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                  You May Also Like
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Handpicked recommendations based on your current selection
                </p>
              </div>
            </div>

            <div className="relative px-8 flex items-center">
              <button className="related-prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                <ChevronLeft size={18} className="text-gray-700" />
              </button>

              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: '.related-prev-btn',
                  nextEl: '.related-next-btn',
                }}
                spaceBetween={20}
                slidesPerView={4}
                breakpoints={{
                  320: {
                    slidesPerView: 1.2,
                    spaceBetween: 12
                  },
                  480: {
                    slidesPerView: 2,
                    spaceBetween: 16
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 18
                  },
                  1200: {
                    slidesPerView: 4,
                    spaceBetween: 20
                  }
                }}
                className="w-full"
              >
                {relatedProducts.map((p) => (
                  <SwiperSlide key={p._id || p.id} className="py-1">
                    <ProductCard product={p} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="related-next-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetail;