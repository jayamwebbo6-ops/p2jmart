import React from 'react';
import Sidebar from '../../components/Sidebar';
import HeroBanner from '../../components/HeroBanner';
import PromoBanners from '../../components/PromoBanners';
import ProductSection from '../../components/ProductSection';
import CategoryPage from '../../components/CategoryPage';
import Collections from '../../components/Collections';

const dummyProducts = [
  {
    id: 1,
    title: 'Premium Wireless Headphones',
    price: 199.00,
    originalPrice: 249.00,
    discount: 20,
    rating: 4.5,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 2,
    title: 'Smart Watch Series 9',
    price: 299.00,
    originalPrice: 349.00,
    discount: 14,
    rating: 4.8,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 3,
    title: 'Portable Bluetooth Speaker',
    price: 79.00,
    originalPrice: 99.00,
    discount: 20,
    rating: 4.3,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 4,
    title: 'Minimalist Wall Clock',
    price: 45.00,
    originalPrice: 59.00,
    discount: 23,
    rating: 4.6,
    reviews: 14,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&h=500&q=80'
  },
  
];

// 1. Accept the global wishlist state and handlers via props here
// 1. Accept the global cart addition handler prop here
const Home = ({ wishlist = [], addToWishlist, removeFromWishlist, onAddToCart }) => {
  return (
    <div className="w-full flex flex-col gap-10">
      {/* Top Row: Sidebar, Hero, Promos */}
      <div className="w-full flex flex-col lg:flex-row gap-5 mt-6">
        <div className="hidden lg:block lg:w-1/4 xl:w-[22%] flex-shrink-0 lg:h-[460px]">
          <Sidebar />
        </div>
        <div className="w-full lg:flex-1 h-[350px] md:h-[400px] lg:h-[460px]">
          <HeroBanner />
        </div>
        <div className="w-full lg:w-1/4 xl:w-[22%] flex-shrink-0 flex flex-col min-[360px]:flex-row lg:flex-col gap-5 h-[auto] min-[360px]:h-[200px] lg:h-[460px]">
          <PromoBanners />
        </div>
      </div>

      {/* Electrical Product Section */}
      <ProductSection 
        title="Electronic " 
        products={dummyProducts}
        wishlist={wishlist}
        onWishlist={addToWishlist}
        onRemoveWishlist={removeFromWishlist} 
        onAddToCart={onAddToCart} // 2. Forward your prop connection down cleanly
      />
      
      <CategoryPage/>
      <Collections/>
    </div>
  );
};

export default Home;