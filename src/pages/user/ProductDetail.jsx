import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Share2, ShoppingBag } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import ProductCard from '../../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = {
    id,
    brand: 'P2J Mart',
    title: 'Premium Wooden Plaque',
    category: 'Gifts',
    price: 300,
    originalPrice: 500,
    discount: 40,
    rating: 4.0,
    reviews: 1,
    images: [
      'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Red', hex: '#E53E3E' },
      { name: 'Green', hex: '#38A169' }
    ],
    sizes: ['3 inch', '5 inch', '7 inch'],
    inStock: true
  };

  const [selectedColor, setSelectedColor] = useState('Blue');
  
  const [selectedSize, setSelectedSize] = useState('5 inch');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  

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
      
      {/* Modification 1: Width Restriction Removed (Product details section) */}
      <div className="w-full">

        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 font-medium flex items-center gap-2 flex-wrap mb-5">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>&gt;</span>
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>&gt;</span>
          <span className="text-gray-900 font-bold">{product.title}</span>
        </div>

        {/* Modification 2: Exact 50 / 50 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
          {/* Left: Product Images - Modification 3: Min-width fix added */}
          <div className="w-full min-w-0">
            {/* Mobile Slider - Modification 10: Responsive mobile gallery height */}
            <div className="block sm:hidden">
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                className="product-swiper rounded-lg overflow-hidden border border-gray-200"
              >
                {product.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-[260px] sm:h-[350px] object-cover"
                      />
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-bold">
                        -{product.discount}%
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {/* Desktop Gallery - Modification 5 & 11: Updated responsive desktop gallery height */}
            <div className="hidden sm:flex gap-3 lg:gap-4 h-[420px] md:h-[500px] lg:h-[600px] w-full">
             {/* Thumbnails - Modification 12: Responsive thumbnail panel size */}
              <div className="flex flex-col gap-2 md:gap-3 w-16 md:w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    /* Modification 12: Responsive individual thumbnail item dimensions */
                    className={`h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-md border-2 shrink-0 ${
                      activeImageIndex === idx
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
             {/* Main Image - Modification 6: Fixed h-full on Main Product Image wrapper */}
              <div className="flex-1 h-full relative overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold">
                  -{product.discount}%
                </div>
              </div>
            </div>
         </div>
          {/* Right: Product Info & Variants - Modification 4: Product Details Column min-w-0 flex update */}
          <div className="w-full min-w-0 flex flex-col gap-4">
           {/* Modification 2: Responsive brand typography sizing */}
            <span className="text-blue-600 font-bold text-xs sm:text-sm">{product.brand}</span>
            {/* Modification 1: Responsive product typography layout */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            {/* Ratings - Modification 3: Grid wrap wrapper configuration & scaled Star SVG icons */}
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
            {/* Meta Information */}
            <div className="text-sm space-y-1.5">
              <p><span className="font-bold text-gray-800">Category:</span> <span className="text-gray-600">{product.category}</span></p>
            </div>
           {/* Pricing Section - Modification 4: Fluid multi-breakpoint typography and column alignment wrapping */}
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-sm sm:text-base lg:text-lg text-gray-400 line-through mb-1 font-medium">₹{product.originalPrice}</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">₹{product.price}</span>
              <span className="text-base sm:text-lg lg:text-xl text-primary font-light mb-1 ml-2 tracking-wide">-{product.discount}%</span>
            </div>
            {/* Variants: Color */}
            <div>
              <p className="font-bold text-gray-800 mb-3 text-sm">Color: <span className="font-normal text-gray-600 ml-1">{selectedColor}</span></p>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    /* Modification 5: Responsive dimension classes for color items */
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color.name ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                    }`}
                  >
                    <span className="w-full h-full rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }}></span>
                  </button>
                ))}
              </div>
            </div>
            {/* Variants: Size */}
            <div>
              <p className="font-bold text-gray-800 mb-3 text-sm">Size: <span className="font-normal text-gray-600 ml-1">{selectedSize}</span></p>
              <div className="flex gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    /* Modification 6: Fluid sizing spacing matrix and text reductions */
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-bold border transition-colors shadow-sm ${
                      selectedSize === size
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <span className="text-green-600 font-bold text-sm tracking-wide">In Stock</span>
            </div>

            {/* Quantity and Icons Row - Modification 7 & 8: Responsive layouts and dimensions for selectors/buttons */}
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

              {/* Modification 8: Wishlist button wrapper dynamic constraints and structural glyph scales */}
              <button className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
                <Heart size={16} className="text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
              </button>
              {/* Modification 8: Share button wrapper dynamic constraints and structural glyph scales */}
              <button className="w-10 h-10 sm:w-11 sm:h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
                <Share2 size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Action Buttons - Modification 9: Enhanced responsive action bar behavior */}
            <div className="flex flex-col md:flex-row gap-3 mt-auto">
              <button className="flex-1 border-2 border-primary text-primary py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-primary/5 transition-colors shadow-sm">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button className="flex-1 bg-primary text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
                <ShoppingBag size={18} /> Buy Now
              </button>
            </div>
           

          </div>
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
        </div>
      </div>

      {/* Related Products Section - Modification 1: Width Restriction Removed (Related products section) */}
      <div className="w-full mt-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {/* Modification 13: Responsive typography sizing for heading element */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Related Products
          </h2>

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

        {/* Slider — h-auto + items-stretch on each slide keeps every card the same height */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".related-prev",
            nextEl: ".related-next",
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          className="!h-auto"
          /* Modification 14: Restructured precise Swiper fluid breakpoints system layout rules */
          breakpoints={{
            320: {
              slidesPerView: 1.2,
            },
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 2.5,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          {relatedProducts.map((prod) => (
            /* Modification 7: Related Product Slide flex added */
            <SwiperSlide key={prod.id} className="!h-auto flex">
              {/* Modification 8: ProductCard Wrapper w-full h-full added */}
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