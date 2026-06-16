import React, { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';

const categories = [
  { 
    name: 'Electronics', 
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Electro 2', 'Electroo 1', 'Mobiles & Tablets', 'Laptops & PCs'],
    promoImage: 'https://images.unsplash.com/photo-1550009158-9effb619a647?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Fashion Jewellery', 
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Necklaces', 'Earrings', 'Rings', 'Bracelets'],
    promoImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Electrical', 
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Wiring', 'Switches', 'Lighting', 'Tools'],
    promoImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Furniture', 
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Living Room', 'Bedroom', 'Office', 'Outdoor'],
    promoImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Gift Items', 
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Birthday', 'Anniversary', 'Corporate', 'Personalized'],
    promoImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Health & Personal Care', 
    image: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Skincare', 'Haircare', 'Supplements', 'Medical'],
    promoImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Pet Supplies', 
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Dog Food', 'Cat Food', 'Toys', 'Accessories'],
    promoImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Books & Stationery', 
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Fiction', 'Non-Fiction', 'Academic', 'Office Supplies'],
    promoImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Sports & Fitness', 
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Cardio', 'Weights', 'Yoga', 'Accessories'],
    promoImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Toys & Games', 
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Board Games', 'Action Figures', 'Puzzles', 'Outdoor'],
    promoImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Automotive', 
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Car Accessories', 'Bike Accessories', 'Cleaners', 'Parts'],
    promoImage: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=300&auto=format&fit=crop'
  },
  { 
    name: 'Home Appliances', 
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=100&auto=format&fit=crop', 
    subcategories: ['Refrigerators', 'Washing Machines', 'Microwaves', 'ACs'],
    promoImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=300&auto=format&fit=crop'
  }
];

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
