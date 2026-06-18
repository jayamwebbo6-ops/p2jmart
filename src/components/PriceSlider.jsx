import React, { useState, useEffect } from "react";

const PriceSlider = ({ minPrice, maxPrice, onFilterChange }) => {
  // Local state isolates fast sliding updates from the rest of the page
  const [sliderMin, setSliderMin] = useState(minPrice);
  const [sliderMax, setSliderMax] = useState(maxPrice);

  // Keep local state in sync if filters are cleared externally
  useEffect(() => {
    setSliderMin(minPrice);
    setSliderMax(maxPrice);
  }, [minPrice, maxPrice]);

  // Commits the changes to the main page engine only when dragging stops
  const handleDragEnd = () => {
    onFilterChange(sliderMin, sliderMax);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gray-800 rounded-sm"></div>
        <h3 className="font-bold text-lg text-gray-800">Price (₹)</h3>
      </div>

      {/* Input Boxes */}
      <div className="flex gap-4 mb-5">
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <input
            type="number"
            value={sliderMin}
            onChange={(e) => {
              const val = Math.max(100, Math.min(Number(e.target.value), sliderMax));
              setSliderMin(val);
              onFilterChange(val, sliderMax);
            }}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <input
            type="number"
            value={sliderMax}
            onChange={(e) => {
              const val = Math.max(sliderMin, Math.min(Number(e.target.value), 10000));
              setSliderMax(val);
              onFilterChange(sliderMin, val);
            }}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
      </div>

      {/* Dual Range Track */}
      <div className="relative w-full h-2 px-1">
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
        <div
          className="absolute h-1 bg-gray-700 top-1/2 -translate-y-1/2"
          style={{ 
            left: `${((sliderMin - 100) / (10000 - 100)) * 100}%`, 
            right: `${100 - ((sliderMax - 100) / (10000 - 100)) * 100}%` 
          }}
        ></div>

        <input
          type="range"
          min="100"
          max="10000"
          value={sliderMin}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setSliderMin(Math.min(Number(e.target.value), sliderMax - 50))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800"
          style={{ zIndex: sliderMin > 9500 ? 5 : 3 }}
        />
        <input
          type="range"
          min="100"
          max="10000"
          value={sliderMax}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setSliderMax(Math.max(Number(e.target.value), sliderMin + 50))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};

export default PriceSlider;