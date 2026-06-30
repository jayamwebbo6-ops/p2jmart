import React, { useState, useEffect } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoriesAPI } from '../api/categoryApi'; 

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

 
  useEffect(() => {
    const fetchSidebarMenuData = async () => {
      try {
        const response = await getCategoriesAPI();
        

        if (response && response.success && Array.isArray(response.data)) {
       
          const processedCategories = response.data.map((cat) => ({
            id: cat._id,
            name: cat.name,
            image: cat.image || 'https://via.placeholder.com/150?text=Category', 
            promoImage: cat.image || 'https://via.placeholder.com/300x200?text=Promo+Offer',
            subcategories: Array.isArray(cat.subcategories) 
              ? cat.subcategories.map(sub => sub.name || sub) 
              : []
          }));
          setCategories(processedCategories);
        }
      } catch (error) {
        console.error("Failed to load marketplace layout data rows:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarMenuData();
  }, []);

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

      {/* Scrollable List Workspace */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-b-lg">
        {loading ? (
          <div className="p-4 text-xs font-semibold text-gray-400 text-center">
            Loading Categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-xs font-semibold text-gray-400 text-center">
            No categories available.
          </div>
        ) : (
          <ul className="flex flex-col py-2">
            {categories.map((cat, idx) => (
              <li 
                key={cat.id || idx} 
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
        )}
      </div>

      {/* Mega Menu Flyout Layer */}
      {!loading && hoveredIndex !== null && categories[hoveredIndex] && (
        <div 
          className="absolute left-full top-[46px] w-[500px] min-h-[360px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 flex rounded-r-2xl animate-flyout"
          style={{ marginLeft: '-1px' }} // Overlaps grid line to eliminate mouse fall-off breaks
        >
          {/* Left Column: Subcategories List Mapping */}
          <div className="w-1/2 p-6 border-r border-slate-100 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-black text-[#003147] leading-tight">
                  {categories[hoveredIndex].name}
                </h3>
                <div className="bg-gradient-to-r from-[#009EDB] to-transparent h-0.5 w-10 mt-1.5 rounded-full"></div>
              </div>

              {categories[hoveredIndex].subcategories.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium">No subcategories linked</p>
              ) : (
                <ul className="flex flex-col gap-1 overflow-y-auto max-h-[250px] custom-scrollbar pr-1">
                  {categories[hoveredIndex].subcategories.map((sub, i) => (
                    <li key={i}>
                      <a 
                        href={`/products?category=${categories[hoveredIndex].name}&subcategory=${sub}`}
                        className="group/sub flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold text-gray-600 hover:text-[#009EDB] hover:bg-slate-50 transition-all duration-200"
                      >
                        <span className="truncate">{sub}</span>
                        <ChevronRight 
                          size={14} 
                          className="opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-200 text-[#009EDB]" 
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Promo Visuals */}
          <div className="w-1/2 p-6 flex flex-col justify-between bg-slate-50/50 rounded-r-2xl">
            <div className="relative overflow-hidden rounded-xl shadow-md border border-slate-100 aspect-[4/3] group/promo w-full mb-4">
              <img 
                src={categories[hoveredIndex].promoImage} 
                alt="Promo Banner" 
                className="w-full h-full object-cover transform scale-100 group-hover/promo:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
              <span className="absolute top-2 left-2 bg-white/95 text-[#003147] text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm tracking-wider">
                Trending
              </span>
            </div>

            <button className="group w-full bg-[#003147] hover:bg-[#009EDB] text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(0,49,71,0.15)] hover:shadow-[0_4px_15px_rgba(0,158,219,0.2)] text-xs sm:text-sm flex items-center justify-center gap-1.5">
             <Link to={`/products`}> <span>View All Products</span></Link>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;