import React, { useState, useEffect } from 'react';
import { getHomeCMS } from '../../public/api/homeCms'; // Adjust this import path to your actual api file path

const HeroBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const res = await getHomeCMS();
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
      <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
        Loading offers...
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    /* REMOVED: All background gradient classes from this parent container wrapper */
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-transparent shadow-sm flex items-center group">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide._id || index}
          /* Displays 100% original full-color opacity with zero blend modes */
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 z-0 group-hover:scale-105' : 'opacity-0 -z-10'}`}
          style={{
            backgroundImage: slide.image ? `url('${slide.image}')` : 'none',
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          {/* Light gray translucent overlay to improve text readability */}
          <div className="absolute inset-0 bg-slate-900/25 z-10" />
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center">
        {slides.map((slide, index) => (
          <div 
            key={slide._id || index} 
            className={`absolute px-8 md:px-12 w-full md:w-3/4 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
          >
            <div className={`transition-all duration-1000 ease-out transform ${currentSlide === index ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
              <p className="text-white text-sm md:text-base font-medium mb-2 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {slide.description}
              </p>
            </div>
            
            <div className={`transition-all duration-1000 ease-out transform ${currentSlide === index ? 'translate-y-0 opacity-100 delay-700' : 'translate-y-8 opacity-0'}`}>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {slides.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors shadow-md ${currentSlide === index ? 'bg-orange-500' : 'bg-white/60 hover:bg-white/90'}`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;