import React, { useState, useEffect } from "react";

const OfferSlider = ({ minDiscount, maxDiscount, onFilterChange }) => {
  // Local state isolates fast sliding updates from the rest of the page
  const [sliderMin, setSliderMin] = useState(minDiscount);
  const [sliderMax, setSliderMax] = useState(maxDiscount);

  // Keep local state in sync if filters are cleared externally
  useEffect(() => {
    setSliderMin(minDiscount);
    setSliderMax(maxDiscount);
  }, [minDiscount, maxDiscount]);

  // Commits the changes to the main page engine only when dragging stops
  const handleDragEnd = () => {
    onFilterChange(sliderMin, sliderMax);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-[#0A2540] rounded-sm"></div>
        <h3 className="font-bold text-lg text-gray-800">Offer / Discount (%)</h3>
      </div>

      {/* Input Boxes */}
      <div className="flex gap-4 mb-5">
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="0"
              max="100"
              value={sliderMin}
              onChange={(e) => {
                const val = Math.max(0, Math.min(Number(e.target.value), sliderMax));
                setSliderMin(val);
                onFilterChange(val, sliderMax);
              }}
              className="w-full outline-none text-gray-700 font-medium bg-transparent"
            />
            <span className="text-xs text-gray-400 font-medium ml-1">% Min</span>
          </div>
        </div>
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="0"
              max="100"
              value={sliderMax}
              onChange={(e) => {
                const val = Math.max(sliderMin, Math.min(Number(e.target.value), 100));
                setSliderMax(val);
                onFilterChange(sliderMin, val);
              }}
              className="w-full outline-none text-gray-700 font-medium bg-transparent"
            />
            <span className="text-xs text-gray-400 font-medium ml-1">% Max</span>
          </div>
        </div>
      </div>

      {/* Dual Range Track */}
      <div className="relative w-full h-2 px-1">
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
        <div
          className="absolute h-1 bg-[#0A2540] top-1/2 -translate-y-1/2"
          style={{ 
            left: `${sliderMin}%`, 
            right: `${100 - sliderMax}%` 
          }}
        ></div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={sliderMin}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setSliderMin(Math.min(Number(e.target.value), sliderMax - 5))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-[#0A2540] [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: sliderMin > 90 ? 5 : 3 }}
        />
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={sliderMax}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setSliderMax(Math.max(Number(e.target.value), sliderMin + 5))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-[#0A2540] [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};

export default OfferSlider;