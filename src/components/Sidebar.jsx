import React, { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { categories } from '../utils/constants';

const Sidebar = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div 
      className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col relative"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Header */}
      <div className="bg-secondary text-white flex items-center px-4 py-3 rounded-t-lg shrink-0 z-20 relative">
        <Menu size={20} className="mr-3" />
        <span className="font-semibold text-sm tracking-wide">ALL CATEGORIES</span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-b-lg">
        <ul className="flex flex-col py-2">
          {categories.map((cat, idx) => (
            <li 
              key={idx} 
              className={`group transition-colors duration-150 ${hoveredIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredIndex(idx)}
            >
              <a href="#" className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center text-gray-700">
                  <img src={cat.image} alt={cat.name} className="w-7 h-7 object-cover rounded shadow-sm mr-3" />
                  <span className={`text-sm font-medium transition-colors ${hoveredIndex === idx ? 'text-primary' : ''}`}>{cat.name}</span>
                </div>
                <ChevronRight size={16} className={`transition-colors transform ${hoveredIndex === idx ? 'text-primary translate-x-0.5' : 'text-gray-300'}`} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Mega Menu Flyout */}
      {hoveredIndex !== null && (
        <div 
          className="absolute left-full top-[46px] w-[450px] min-h-[350px] bg-white border border-gray-200 shadow-2xl z-50 flex rounded-r-lg opacity-100 transition-opacity duration-200"
          style={{ marginLeft: '-1px' }} // Slightly overlaps to avoid the mouse falling through a gap
        >
          {/* Left Column: Subcategories */}
          <div className="w-1/2 p-6 border-r border-gray-100 flex flex-col">
            <h3 className="font-bold text-primary mb-4 border-b border-gray-100 pb-2">{categories[hoveredIndex].name}</h3>
            <ul className="flex flex-col space-y-3">
              {categories[hoveredIndex].subcategories.map((sub, i) => (
                <li key={i} className="text-sm text-gray-600 hover:text-secondary cursor-pointer transition-colors pb-2 border-b border-gray-50 last:border-0">
                  {sub}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Promo Image & Button */}
          <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50/50 rounded-r-lg">
            <div className="w-full h-40 mb-5 overflow-hidden rounded-md shadow-sm border border-gray-100">
              <img 
                src={categories[hoveredIndex].promoImage} 
                alt="Promo" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <button className="w-full border-2 border-secondary text-secondary font-semibold py-2 rounded hover:bg-secondary hover:text-white transition-colors text-sm">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
