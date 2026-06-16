import React, { useState, useEffect } from 'react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Taking your Viewing Experience to Next Level',
    title: 'Boat Headphone'
  },
  {
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Experience True Wireless Freedom',
    title: 'Premium Earbuds'
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Track your Fitness effortlessly',
    title: 'Smart Watch Series 8'
  }
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance the slider every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-800 shadow-sm flex items-center group">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-50 z-0 mix-blend-overlay group-hover:scale-105' : 'opacity-0 -z-10'}`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        ></div>
      ))}

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute px-8 md:px-12 w-full md:w-3/4 transition-all duration-700 ease-in-out transform ${currentSlide === index ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <p className="text-white text-sm md:text-base font-medium mb-2 opacity-90 tracking-wide drop-shadow-sm">
              {slide.subtitle}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 drop-shadow-md leading-tight">
              {slide.title}
            </h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl text-sm tracking-wide">
              SHOP NOW
            </button>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors shadow-sm ${currentSlide === index ? 'bg-orange-500' : 'bg-white/50 hover:bg-white/80'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
