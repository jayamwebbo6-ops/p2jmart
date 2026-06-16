import React, { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = location.state?.product || {
    id,
    title: 'Premium Wireless Headphones',
    price: 211.00,
    originalPrice: 222.00,
    discount: 5,
    rating: 4.5,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
    description: 'Experience premium sound quality with these high-fidelity wireless headphones. Featuring active noise cancellation, a 40-hour battery life, and spatial audio support for a truly immersive listening experience. Built with ultra-comfortable memory foam ear cups for all-day wear.'
  };

  return (
    <div className="w-full mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-10 flex flex-col md:flex-row gap-10">
      {/* Left: Product Image */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-4">
        <div className="aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-2 relative group">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        </div>
        {/* Thumbnails */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-20 h-20 border rounded cursor-pointer overflow-hidden ${i === 1 ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary'}`}>
               <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link> 
          <span className="mx-2 text-gray-300">/</span> 
          <span className="hover:text-primary transition-colors cursor-pointer">Electronics</span> 
          <span className="mx-2 text-gray-300">/</span> 
          <span className="text-gray-800">{product.title}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.title}</h1>
        
        {/* Ratings */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={18} 
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                strokeWidth={i < Math.floor(product.rating) ? 0 : 2} 
                className={i >= Math.floor(product.rating) ? "text-gray-300" : ""} 
              />
            ))}
          </div>
          <span className="text-gray-600 font-medium text-sm hover:text-primary transition-colors cursor-pointer">{product.reviews} Customer Reviews</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <span className="text-4xl font-bold text-primary">₹{product.price.toFixed(2)}</span>
          <span className="text-lg text-gray-400 line-through mb-1 font-medium">₹{product.originalPrice.toFixed(2)}</span>
          <span className="text-sm font-bold text-green-600 mb-2 bg-green-100 px-2 py-1 rounded">Save ₹{(product.originalPrice - product.price).toFixed(2)}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {product.description || 'This is a premium product designed to meet all your needs with high quality materials and excellent craftsmanship.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
          <button className="flex-1 bg-primary text-white py-3.5 px-6 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-secondary transition-colors text-lg shadow-md hover:shadow-lg transform active:scale-95">
            <ShoppingCart size={22} />
            Add to Cart
          </button>
          <button className="bg-gray-50 text-gray-700 py-3.5 px-6 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors border border-gray-200 group shadow-sm">
            <Heart size={22} className="group-hover:fill-red-500 transition-colors" />
            Wishlist
          </button>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-500 p-2.5 rounded-full"><Truck size={24} /></div>
            <div className="text-sm"><span className="font-bold text-gray-800 block">Free Shipping</span><span className="text-gray-500">Over ₹500</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 text-green-500 p-2.5 rounded-full"><RotateCcw size={24} /></div>
            <div className="text-sm"><span className="font-bold text-gray-800 block">30 Days</span><span className="text-gray-500">Easy Returns</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 text-yellow-500 p-2.5 rounded-full"><ShieldCheck size={24} /></div>
            <div className="text-sm"><span className="font-bold text-gray-800 block">1 Year</span><span className="text-gray-500">Warranty</span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
