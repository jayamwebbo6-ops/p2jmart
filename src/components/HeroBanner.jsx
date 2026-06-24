import React, { useState, useEffect } from 'react';
import { getHomeCMS } from '../api/homeCms'; // Adjust this import path to your actual api file path

const HeroBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const res = await getHomeCMS();
        // FIXED: Accessing res.data.heroSlider instead of res.heroSlider
        if (res && res.data && Array.isArray(res.data.heroSlider)) {
          setSlides(res.data.heroSlider);
        }
      } catch (error) {
        console.error("Error fetching hero slider from CMS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-lg bg-gray-800 animate-pulse flex items-center justify-center text-white/50 text-sm">
        Loading offers...
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-800 shadow-sm flex items-center group">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-50 z-0 mix-blend-overlay group-hover:scale-105' : 'opacity-0 -z-10'}`}
          style={{
            backgroundImage: slide.image ? `url('${slide.image}')` : 'none',
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        ></div>
      ))}

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {slides.map((slide, index) => (
          <div 
            key={slide._id || index} 
            className={`absolute px-8 md:px-12 w-full md:w-3/4 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
          >
            <div className={`transition-all duration-1000 ease-out transform ${currentSlide === index ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
              <p className="text-white text-sm md:text-base font-medium mb-2 text-white/90 tracking-wide drop-shadow-sm">
                {slide.description}
              </p>
            </div>
            
            <div className={`transition-all duration-1000 ease-out transform ${currentSlide === index ? 'translate-y-0 opacity-100 delay-700' : 'translate-y-8 opacity-0'}`}>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-8 drop-shadow-md leading-tight">
                {slide.title}
              </h2>
            </div>
            
            <div className={`transition-all duration-1000 ease-out transform ${currentSlide === index ? 'translate-y-0 opacity-100 delay-1000' : 'translate-y-8 opacity-0'}`}>
              <button 
                onClick={() => { if(slide.btnLink) window.location.href = slide.btnLink; }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-0.5 hover:shadow-xl text-sm tracking-wide cursor-pointer"
              >
                {slide.btnLabel || 'SHOP NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors shadow-sm ${currentSlide === index ? 'bg-orange-500' : 'bg-white/50 hover:bg-white/80'}`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;