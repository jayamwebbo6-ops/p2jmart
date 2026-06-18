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
    title: 'Ele Pro 2',
    price: 211.00,
    originalPrice: 222.00,
    discount: 5,
    rating: 4.5,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    title: 'Ele 3',
    price: 222.00,
    originalPrice: 1333.00,
    discount: 83,
    rating: 4.0,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    title: 'Ele Pro 1',
    price: 54.00,
    originalPrice: 55.00,
    discount: 2,
    rating: 4.5,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    title: 'Ele Pro Max',
    price: 199.00,
    originalPrice: 250.00,
    discount: 20,
    rating: 5.0,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80'
  }
];

// 1. Accept the global wishlist state and handlers via props here
const Home = ({ wishlist = [], addToWishlist, removeFromWishlist }) => {
  return (
    <div className="w-full flex flex-col gap-10">
      {/* Top Row: Sidebar, Hero, Promos */}
      <div className="w-full flex flex-col lg:flex-row gap-5 mt-6">
        {/* Left Sidebar: 20-25% width - Hidden on mobile/tablet */}
        <div className="hidden lg:block lg:w-1/4 xl:w-[22%] flex-shrink-0 lg:h-[460px]">
          <Sidebar />
        </div>
        
        {/* Center Hero: Flexible width */}
        <div className="w-full lg:flex-1 h-[350px] md:h-[400px] lg:h-[460px]">
          <HeroBanner />
        </div>

        {/* Right Promo Banners: 20-25% width */}
        <div className="w-full lg:w-1/4 xl:w-[22%] flex-shrink-0 flex flex-col min-[360px]:flex-row lg:flex-col gap-5 h-[auto] min-[360px]:h-[200px] lg:h-[460px]">
          <PromoBanners />
        </div>
      </div>

      {/* Electrical Product Section */}
      <ProductSection 
        title="Featured Products" 
        products={dummyProducts} // 2. Swapped placeholder 'featuredProductsList' for your 'dummyProducts' array
        wishlist={wishlist}
        onWishlist={addToWishlist} // 3. Connected parent handlers
        onRemoveWishlist={removeFromWishlist}
      />
      
      <CategoryPage/>
      <Collections/>
    </div>
  );
};

export default Home;