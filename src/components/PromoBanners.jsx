import React from 'react';

const PromoBanners = () => {
  return (
    <>
      {/* Top Banner */}
      <div className="w-full flex-1 rounded-lg overflow-hidden relative bg-gradient-to-br from-orange-200 to-orange-400 shadow-sm group cursor-pointer">
        <div 
          className="absolute inset-0 opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        ></div>
        <div className="relative z-10 p-6 flex flex-col h-full justify-start">
          <p className="text-white font-medium text-sm drop-shadow-sm mb-1 tracking-wide">iPhone Collection</p>
          <h3 className="text-white font-bold text-2xl drop-shadow-md">25% OFF</h3>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="w-full flex-1 rounded-lg overflow-hidden relative bg-gradient-to-br from-[#4dd0e1] to-[#009EDB] shadow-sm group cursor-pointer">
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-500 ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        ></div>
        <div className="relative z-10 p-6 flex flex-col h-full justify-start items-end text-right">
          <p className="text-white font-medium text-sm drop-shadow-sm mb-1 tracking-wide">MAC Computer</p>
          <h3 className="text-white font-bold text-2xl drop-shadow-md">25% OFF</h3>
          <span className="text-white text-xs mt-auto underline decoration-white/50 hover:decoration-white transition-colors group-hover:translate-x-[-2px]">
            Shop Now
          </span>
        </div>
      </div>
    </>
  );
};

export default PromoBanners;
