import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ShoppingBag, Star, ChevronUp, Share2, Plus, Minus, Upload, Eye, Type, CheckCircle } from 'lucide-react';

// Swiper imports for carousels
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const CustomizedProductDetails = () => {
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

  const product = location.state?.product || {
    id: productId || 1,
    title: "SNAP ART Customized Photo and Song Spotify Frame, Personalized Frame with scannable code | Birthday | Valentine Day, Anniversary | for Mothers,",
    price: 500,
    originalPrice: 550,
    discount: 9,
    rating: 4.0,
    reviews: 21,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(product.image);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTextInputPanel, setShowTextInputPanel] = useState(false);
  const [customUserText, setCustomUserText] = useState('');

  // Zoom Transform Setup (In-container bounds constraint)
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const containerRef = useRef(null);

  const productGalleryThumbnails = Array(4).fill(product.image);

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
      setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleMouseMoveZoom = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)' 
    });
  };

  const handleMouseLeaveZoom = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  return (
    <div className="w-full antialiased text-gray-800 selection:bg-gray-200 min-w-0 relative">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-gray-50/50 border-b border-gray-100 flex items-center justify-end text-xs text-gray-500 gap-1.5 py-2 px-4">
        <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span>&gt;</span>
        <span className="hover:text-blue-500 cursor-pointer">Custom Pages</span>
        <span>&gt;</span>
        <span className="text-gray-700 font-medium">CustomProductDetail Page</span>
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
              className="w-full aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
            >
              {productGalleryThumbnails.map((imgUrl, idx) => (
                <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center">
                  <img src={imgUrl} alt={`Product Slide ${idx}`} className="w-full h-full object-cover select-none" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Desktop Matrix Side Thumbnails + Framed Zoom Display: Visible above 638px */}
          <div className="hidden min-[639px]:flex flex-row gap-3 w-full">
            <div className="flex flex-col gap-2 flex-shrink-0 w-12 sm:w-16 md:w-20">
              {productGalleryThumbnails.map((thumbUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePreviewImage(thumbUrl)}
                  className={`aspect-square w-full rounded border overflow-hidden cursor-pointer bg-gray-50 transition-all ${
                    activePreviewImage === thumbUrl ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={thumbUrl} alt="Gallery Thumb" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div 
              ref={containerRef}
              onMouseMove={handleMouseMoveZoom}
              onMouseLeave={handleMouseLeaveZoom}
              className="flex-grow aspect-square border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-zoom-in"
            >
              <img 
                src={activePreviewImage} 
                alt={product.title} 
                style={zoomStyle}
                className="w-full h-full object-cover transition-transform duration-75 ease-out pointer-events-none select-none"
              />
              <button className="absolute top-3 right-3 p-2 bg-white/90 text-gray-700 rounded-full shadow border border-gray-100 pointer-events-none z-10">
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Details Panel Dashboard */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-5 w-full min-w-0 relative">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
              SNAP ART Customized Photo
            </h1>
            
            <div className="flex items-baseline gap-2 mt-3 flex-wrap">
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
              <span className={`text-2xl font-bold ${colors.primaryText}`}>₹{product.price}</span>
          
              {product.discount > 0 && (
                <span className="text-sm font-semibold text-primary px-1.5 py-0.5 rounded">
                  {product.discount}% Off
                </span>
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

          <div className="flex flex-col gap-2.5 text-xs font-medium text-gray-600 border-t border-b border-gray-100 py-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 p-1 rounded-sm">🛡️</span>
              <span>1 year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-50 text-purple-700 p-1 rounded-sm">🔄</span>
              <span>3 Days Replacement Policy Window</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 p-1 rounded-sm">📦</span>
              <span>Home Delivery Available Across Regions</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full border-b border-gray-100 pb-5">
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
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-auto">
            <button className="flex-1 border-2 border-primary text-primary py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-primary/5 transition-colors shadow-sm">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="flex-1 bg-primary text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
              <ShoppingBag size={18} /> Buy Now
            </button>
          </div>

          <div className="w-full border border-gray-200/80 rounded-lg p-4 bg-gray-50/30 flex flex-col gap-3 mt-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wide">Customize This Product</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Upload Custom Image Layout Specifications</p>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center border border-gray-300 rounded bg-white overflow-hidden text-xs">
              <label className="bg-gray-100 hover:bg-gray-200 border-r border-gray-300 text-gray-700 px-4 py-2.5 font-semibold text-center cursor-pointer select-none transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Upload size={12} /> Choose File
                <input type="file" accept="image/*" onChange={handleFileChangeAction} className="hidden" />
              </label>
              <div className="px-3 py-2 text-gray-500 truncate flex-grow bg-white min-w-0">
                {selectedImageFile ? selectedImageFile.name : "No file chosen"}
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400">Max file size constraints: 5MB (JPG, PNG, GIF)</p>

            <button 
              onClick={() => setShowTextInputPanel(!showTextInputPanel)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded transition-all shadow-sm active:scale-[0.99] mt-1"
            >
              {showTextInputPanel ? "Hide Customization Console" : "Preview Customization Matrix"}
            </button>
          </div>

          {showTextInputPanel && (
            <div className="w-full border border-emerald-200 rounded-lg p-4 bg-emerald-50/20 flex flex-col gap-3 transition-all duration-300">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Type size={15} />
                <h4 className="text-xs font-bold uppercase tracking-wide">Custom Frame Text Inscription</h4>
              </div>
              <textarea
                value={customUserText}
                onChange={(e) => setCustomUserText(e.target.value)}
                placeholder="Enter customized names, songs, dedications, dates, or custom Spotify text tracks..."
                rows={3}
                className="w-full p-2.5 text-xs text-gray-800 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-400"
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
              {product.title} Perfect design payload for birthday celebrations, valentine memory books, wedding anniversary milestones, or customized gift tokens for family and friends.
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