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

  return (
    <div className="w-full  min-h-screen py-8 font-sans">
      <div className="max-w-6xl ">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-8 font-medium flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>&gt;</span>
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>&gt;</span>
          <span className="text-gray-900 font-bold">{product.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        
        {/* Left: Product Images (Vertical Strip Layout) */}
     {/* Product Images Slider */}
<div className="w-full md:w-1/2">

  {/* Mobile Slider */}
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
              className="w-full h-[350px] object-cover"
            />

            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold">
              -{product.discount}%
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>

  {/* Desktop Gallery */}
  <div className="hidden sm:flex gap-4 h-[500px]">

    {/* Thumbnails */}
    <div className="flex flex-col gap-3 w-20">
      {product.images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => setActiveImageIndex(idx)}
          className={`h-20 overflow-hidden rounded-md border-2 ${
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

    {/* Main Image */}
    <div className="flex-1 relative overflow-hidden">
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

        {/* Right: Product Info & Variants */}
        <div className="w-full md:w-1/2 flex flex-col py-2">
          
          <span className="text-blue-600 font-bold text-sm mb-1.5">{product.brand}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2.5">{product.title}</h1>
          
          {/* Ratings */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex text-[#ffc107]">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  strokeWidth={i < Math.floor(product.rating) ? 0 : 2} 
                  className={i >= Math.floor(product.rating) ? "text-gray-300" : ""} 
                />
              ))}
            </div>
            <span className="font-bold text-gray-800 text-sm">{product.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({product.reviews} Customer Reviews)</span>
          </div>

          {/* Meta Information */}
          <div className="text-sm space-y-1.5 mb-3">
            <p><span className="font-bold text-gray-800">Category:</span> <span className="text-gray-600">{product.category}</span></p>
          
          </div>

          {/* Pricing Section */}
          <div className="flex items-end gap-3 mb-4">
            <span className="text-lg text-gray-400 line-through mb-1 font-medium">₹{product.originalPrice}</span>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">₹{product.price}</span>
            <span className="text-xl text-primary font-light mb-1 ml-2 tracking-wide">-{product.discount}%</span>
          </div>

          {/* Variants: Color */}
          <div className="mb-3">
            <p className="font-bold text-gray-800 mb-3 text-sm">Color: <span className="font-normal text-gray-600 ml-1">{selectedColor}</span></p>
            <div className="flex gap-3">
              {product.colors.map(color => (
                <button 
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === color.name ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                  }`}
                >
                  <span className="w-full h-full rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Variants: Size */}
          <div className="mb-3">
            <p className="font-bold text-gray-800 mb-3 text-sm">Size: <span className="font-normal text-gray-600 ml-1">{selectedSize}</span></p>
            <div className="flex gap-3">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold border transition-colors shadow-sm ${
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
          <div className="mb-5">
            <span className="text-green-600 font-bold text-sm tracking-wide">In Stock</span>
          </div>

          {/* Quantity and Icons Row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-11 w-32 shadow-sm">
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

            <button className="w-11 h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
              <Heart size={18} className="text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
            </button>
            <button className="w-11 h-11 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm group">
              <Share2 size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button className="flex-1 border-2 border-primary text-primary py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-primary/5 transition-colors shadow-sm">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="flex-1 bg-primary text-white py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
              <ShoppingBag size={18} /> Buy Now
            </button>
          </div>

        </div>
      </div>
      </div>

      {/* Related Products Section */}
     <div className="max-w-6xl">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-900">
      Related Products
    </h2>

    <div className="flex gap-2">
      <button className="related-prev w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
        <ChevronLeft size={20} />
      </button>

      <button className="related-next w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
        <ChevronRight size={20} />
      </button>
    </div>
  </div>

  {/* Slider */}
  <Swiper
    modules={[Navigation]}
    navigation={{
      prevEl: ".related-prev",
      nextEl: ".related-next",
    }}
    spaceBetween={16}
    slidesPerView={1.2}
    breakpoints={{
      640: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
      },
    }}
  >
    {relatedProducts.map((prod) => (
      <SwiperSlide key={prod.id}>
        <ProductCard product={prod} />
      </SwiperSlide>
    ))}
  </Swiper>

</div>

    </div>
  );
};

export default ProductDetail;
