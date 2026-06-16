import React from 'react';

const HeroBanner = () => {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-800 shadow-sm flex items-center group">
      {/* Background Image Placeholder */}
      <div 
        className="absolute inset-0 opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop')",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      ></div>

      <div className="relative z-10 px-8 md:px-12 w-full md:w-3/4">
        <p className="text-white text-sm md:text-base font-medium mb-2 opacity-90 tracking-wide drop-shadow-sm">
          Taking your Viewing Experience to Next Level
        </p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 drop-shadow-md leading-tight">
          Boat Headphone
        </h2>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl text-sm tracking-wide">
          SHOP NOW
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer transition-colors shadow-sm"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer transition-colors shadow-sm"></div>
      </div>
    </div>
  );
};

export default HeroBanner;
