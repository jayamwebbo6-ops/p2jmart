import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Share2, ShoppingBag, Eye, Plus } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import ProductCard from '../../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- DYNAMIC DATA INTEGRATION LAYER ---
  // Read the dynamic product passed from parent routing context
  const incomingProduct = location.state?.product;

  // Render a safety state if someone lands directly on this route without product data context
  if (!incomingProduct) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">No Product Data Found</h2>
        <p className="text-gray-500 text-sm mt-1 mb-4">Please return to the store catalog to select a product.</p>
        <Link to="/shop" className="bg-primary text-white px-5 py-2 rounded-md font-bold text-sm shadow">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Pure data parsing direct from Mongoose model parameters
  const product = {
    id: incomingProduct._id || incomingProduct.id,
    brand: incomingProduct.brand || '',
    title: incomingProduct.title || incomingProduct.name || 'Product Details',
    // Safe extraction of populated Category object string { id, name }
    category: typeof incomingProduct.category === 'object' && incomingProduct.category?.name
      ? incomingProduct.category.name 
      : (incomingProduct.category || 'Catalog'),
    price: incomingProduct.price || 0,
    originalPrice: incomingProduct.originalPrice || Math.round((incomingProduct.price || 0) * 1.4),
    discount: incomingProduct.discount || 0,
    rating: incomingProduct.rating ?? 5,
    reviews: incomingProduct.reviews || 0,
    // Extract images safely from variant trees, or slide in the master cover image
    images: incomingProduct.images || (incomingProduct.image ? [incomingProduct.image] : []),
    
    // Fallback parser processing variant attribute configurations dynamically
    colors: incomingProduct.colors || (incomingProduct.variants 
      ? [...new Set(incomingProduct.variants.map(v => v.attributes?.color))].filter(Boolean).map(c => ({ name: c, hex: c }))
      : []),
      
    sizes: incomingProduct.sizes || (incomingProduct.variants
      ? [...new Set(incomingProduct.variants.map(v => v.attributes?.size))].filter(Boolean)
      : []),
      
    inStock: incomingProduct.inStock !== undefined 
      ? incomingProduct.inStock 
      : (incomingProduct.variants?.some(v => v.stock > 0) ?? true)
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Handle dynamic initialization of variant selection rules safely
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Sync selection instances if alternative product parameters swap
  useEffect(() => {
    if (product.colors[0]?.name) setSelectedColor(product.colors[0].name);
    if (product.sizes[0]) setSelectedSize(product.sizes[0]);
    setActiveImageIndex(0);
    setQuantity(1);
  }, [id]);

  // --- INTERACTIVE DUMMY DATA FOR COMBO PRODUCT INTEGRATION ---
  const comboData = {
    id: "COMBO-WS100",
    title: "Premium Executive Desk Gift Combo",
    discountPercent: 50,
    items: [
      {
        id: product.id,
        title: `${product.title} (${selectedColor} / ${selectedSize}) (This Item)`,
        price: product.price,
        image: product.images[0] || '',
        isCurrent: true
      },
      {
        id: 'combo-sub-2',
        title: 'Luxury Matte Black Signature Pen',
        price: 150,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=300&h=300&q=80',
        isCurrent: false
      },
      {
        id: 'combo-sub-3',
        title: 'Handcrafted Leather Card Holder',
        price: 250,
        image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=300&h=300&q=80',
        isCurrent: false
      }
    ]
  };

  const [selectedComboItemIds, setSelectedComboItemIds] = useState(comboData.items.map(item => item.id));

  useEffect(() => {
    setSelectedComboItemIds(comboData.items.map(item => item.id));
  }, [id]);

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

  const toggleComboItem = (itemId, isCurrent) => {
    if (isCurrent) return;
    if (selectedComboItemIds.includes(itemId)) {
      setSelectedComboItemIds(selectedComboItemIds.filter(i => i !== itemId));
    } else {
      setSelectedComboItemIds([...selectedComboItemIds, itemId]);
    }
  };

  const isFullComboSelected = selectedComboItemIds.length === comboData.items.length;
  const regularComboSum = comboData.items
    .filter(item => selectedComboItemIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const finalComboPrice = isFullComboSelected 
    ? Math.round(regularComboSum * (1 - comboData.discountPercent / 100)) 
    : regularComboSum;

  const totalComboSavings = regularComboSum - finalComboPrice;

  const handleAddBundleToCart = () => {
    const selectedItems = comboData.items.filter(item => selectedComboItemIds.includes(item.id));
    const bundleCartPayload = {
      id: isFullComboSelected ? comboData.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFullComboSelected ? comboData.title : "Custom Pack Bundle Deal",
      price: finalComboPrice,
      quantity: 1, 
      image: comboData.items[0].image, 
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      includedProducts: selectedItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price
      }))
    };
    console.log("Adding bundle to cart store:", bundleCartPayload);
    navigate('/cart', { state: { incomingBundle: bundleCartPayload } });
  };

  const handleAddBundleToBuy = () => {
    const selectedItems = comboData.items.filter(item => selectedComboItemIds.includes(item.id));
    const bundleCheckoutPayload = {
      id: isFullComboSelected ? comboData.id : `COMBO-CUSTOM-${Date.now()}`,
      title: isFullComboSelected ? comboData.title : "Custom Pack Bundle Deal",
      price: finalComboPrice,
      quantity: 1,
      image: comboData.items[0].image,
      isComboProduct: true,
      selectedOptions: { color: selectedColor, size: selectedSize },
      includedProducts: selectedItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price
      }))
    };
    navigate('/checkout', { state: { directPurchaseBundle: bundleCheckoutPayload } });
  };

  // --- DUMMY DATA FOR RELATED PRODUCTS ---
  const relatedProducts = [
    {
      id: 'rel1',
      title: 'Samsung A1',
      price: 50000.00,
      originalPrice: 54000.00,
      discount: 7,
      rating: 4.5,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'rel2',
      title: 'Samsung C3',
      price: 5454.00,
      originalPrice: 5555.00,
      discount: 2,
      rating: 4.5,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'rel3',
      title: 'Samsung D21',
      price: 5400.00,
      originalPrice: 55000.00,
      discount: 90,
      rating: 4.5,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'rel4',
      title: 'Samsung E5',
      price: 4444.00,
      originalPrice: 5555.00,
      discount: 20,
      rating: 4.5,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80'
    }
  ];
  const showNavigation = relatedProducts.length > 4;

  return (
    <div className="w-full font-sans mt-8">
      <div className="w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            {product.category || "Shop"}
          </Link>
          {incomingProduct.subcategory && (
            <>
              <span className="text-gray-300">/</span>
              <span 
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate("/subCategory", { 
                  state: { 
                    subcategoryId: incomingProduct.subcategory?._id || incomingProduct.subcategory?.id || incomingProduct.subcategory, 
                    subcategoryName: typeof incomingProduct.subcategory === 'object' && incomingProduct.subcategory?.name ? incomingProduct.subcategory.name : incomingProduct.subcategory,
                    categoryName: typeof incomingProduct.category === 'object' && incomingProduct.category?.name ? incomingProduct.category.name : incomingProduct.category
                  } 
                })}
              >
                {typeof incomingProduct.subcategory === 'object' && incomingProduct.subcategory?.name ? incomingProduct.subcategory.name : incomingProduct.subcategory}
              </span>
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
                        <img src={img} alt="" className="w-full h-full object-cover" />
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
                    <img src={img} alt="" className="w-full h-full object-cover" />
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
                  <img
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.title}
                    style={zoomStyle}
                    className="w-full h-full object-cover transition-transform duration-75 ease-out pointer-events-none select-none"
                  />
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
          <div className="w-full min-w-0 flex flex-col gap-4">
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
            <div className="flex flex-wrap items-end gap-2">
              {product.originalPrice > product.price && (
                <span className="text-sm sm:text-base lg:text-lg text-gray-400 line-through mb-1 font-medium">₹{product.originalPrice}</span>
              )}
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">₹{product.price}</span>
              {product.discount > 0 && (
                <span className="text-base sm:text-lg lg:text-xl text-primary font-light mb-1 ml-2 tracking-wide">-{product.discount}%</span>
              )}
            </div>

              {/* Variants: Color */}
{product.colors.length > 0 && (
  <div>
    <p className="font-bold text-gray-800 mb-3 text-sm">
      Color: <span className="font-normal text-gray-600 ml-1">
        {/* If the selected color name contains a separator, show only the human-readable text */}
        {selectedColor.includes('|') ? selectedColor.split('|')[0] : selectedColor}
      </span>
    </p>
    <div className="flex gap-3">
      {product.colors.map(color => {
        // Safely parse name and hex if they are joined together like "Blue|#3B82F6"
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
          >
            {/* Inner check dot wrapper indicating selection */}
          
          </button>
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
              <span className={product.inStock ? "text-green-600 font-bold text-sm tracking-wide" : "text-red-500 font-bold text-sm tracking-wide"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-10 sm:h-11 w-28 sm:w-32 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
                >
                  -
                </button>
                <div className="w-1/3 h-full flex items-center justify-center border-x border-gray-300 font-bold text-sm bg-gray-50 text-gray-800">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-medium transition-colors"
                >
                  +
                </button>
              </div>

              <button className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
                <Heart size={16} className="text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
              </button>
              <button className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
                <Share2 size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Action Buttons */}
           <div className="grid grid-cols-2 max-[408px]:grid-cols-1 gap-2 mt-auto w-full max-w-sm">
  <button className="w-full border-2 border-primary text-primary py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-bold flex justify-center items-center gap-1.5 hover:bg-primary/5 transition-colors shadow-sm">
    <ShoppingCart size={15} /> Add to Cart
  </button>
  <button className="w-full bg-primary text-white py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-bold flex justify-center items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm">
    <ShoppingBag size={15} /> Buy Now
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
                {incomingProduct.detailedDescription || incomingProduct.description || `${product.title} processing configuration metadata options.`}
              </span>
            </div>
          </div>
        </div>

        {/* Combo Pack Section */}
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

          <div className="flex flex-col xl:flex-row gap-6 items-stretch">
            {/* Left Column Grid Items */}
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
              {comboData.items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <div 
                    onClick={() => toggleComboItem(item.id, item.isCurrent)}
                    className={`flex-1 w-full md:w-auto bg-white border rounded-xl p-3.5 flex flex-row md:flex-col items-center gap-3 transition-all relative ${
                      item.isCurrent ? 'cursor-default border-blue-400 ring-1 ring-blue-100' : 'cursor-pointer select-none'
                    } ${
                      selectedComboItemIds.includes(item.id) 
                        ? 'border-blue-500 shadow-sm' 
                        : 'opacity-50 border-gray-200 grayscale scale-95 hover:opacity-80'
                    }`}
                  >
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <input 
                        type="checkbox" 
                        checked={selectedComboItemIds.includes(item.id)} 
                        readOnly
                        disabled={item.isCurrent}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-gray-300"
                      />
                    </div>

                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 md:text-center min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug md:h-8">
                        {item.title}
                      </h4>
                      <p className="text-sm font-black text-gray-900 mt-1">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>

                  {idx < comboData.items.length - 1 && (
                    <div className="text-gray-400 bg-gray-200/60 p-1.5 rounded-full shrink-0">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Right Summary Calculations Block */}
            <div className="w-full xl:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
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
                      💡 Select <strong>all constituent products</strong> to unlock the {comboData.discountPercent}% price discount tier!
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-bold text-gray-800">Final Price:</span>
                  <div className="text-right">
                    {totalComboSavings > 0 && (
                      <span className="text-xs text-gray-400 line-through mr-1.5 font-medium">₹{regularComboSum}</span>
                    )}
                    <span className="text-xl sm:text-2xl font-black text-gray-900">₹{finalComboPrice}</span>
                  </div>
                </div>

                {totalComboSavings > 0 && (
                  <p className="text-[11px] text-right font-bold text-green-600 mb-4">
                    Your instant pocket savings: ₹{totalComboSavings}
                  </p>
                )}

                <div className="grid grid-cols-2 max-[508px]:grid-cols-1 xl:grid-cols-1 gap-2 mt-4 w-full">
  <button 
    onClick={handleAddBundleToCart}
    disabled={selectedComboItemIds.length === 0}
    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 text-xs sm:text-sm rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ShoppingCart size={15} /> Add Bundle Package to Cart
  </button>

  <button 
    onClick={handleAddBundleToBuy}
    disabled={selectedComboItemIds.length === 0}
    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 text-xs sm:text-sm rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ShoppingBag size={15} /> Buy Bundle Package
  </button>
</div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Swiper Section */}
      <div className="w-full mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Related Products</h2>
          {showNavigation && (
            <div className="flex gap-2">
              <button className="related-prev w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                <ChevronLeft size={20} />
              </button>
              <button className="related-next w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{ prevEl: ".related-prev", nextEl: ".related-next" }}
          spaceBetween={16}
          slidesPerView={1.2}
          className="!h-auto"
          breakpoints={{
            320: { slidesPerView: 1.2 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 4 },
          }}
        >
          {relatedProducts.map((prod) => (
            <SwiperSlide key={prod.id} className="!h-auto flex">
              <div className="w-full h-full">
                <ProductCard product={prod} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductDetail;