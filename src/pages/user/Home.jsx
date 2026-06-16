import React from 'react';
import Sidebar from '../../components/Sidebar';
import HeroBanner from '../../components/HeroBanner';
import PromoBanners from '../../components/PromoBanners';

const Home = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 mt-6">
      {/* Left Sidebar: 20-25% width */}
      <div className="w-full lg:w-1/4 xl:w-[22%] flex-shrink-0 lg:h-[460px]">
        <Sidebar />
      </div>
      
      {/* Center Hero: Flexible width */}
      <div className="w-full lg:flex-1 h-[400px] lg:h-[460px]">
        <HeroBanner />
      </div>

      {/* Right Promo Banners: 20-25% width */}
      <div className="w-full lg:w-1/4 xl:w-[22%] flex-shrink-0 flex flex-col gap-5 h-[400px] lg:h-[460px]">
        <PromoBanners />
      </div>
    </div>
  );
};

export default Home;
