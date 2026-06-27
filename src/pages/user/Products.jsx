import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { getCategoriesAPI } from '../../api/categoryApi'; 

// Placeholder/fallback image array so the hash selection doesn't crash the UI
const subcategoryImages = [
  "https://via.placeholder.com/150?text=Category+1",
  "https://via.placeholder.com/150?text=Category+2",
  "https://via.placeholder.com/150?text=Category+3",
];

const getSubcategoryImage = (catName, subName, idx, subImage) => {
  if (subImage) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    // If the image is already a fully qualified URL, return it directly
    if (subImage.startsWith('http://') || subImage.startsWith('https://')) {
      return subImage;
    }
    // Clean leading slashes and prefix with backend API server authority domain
    return `${BACKEND_URL}/${subImage.replace(/^\//, '')}`;
  }
  const hash = catName.length + subName.length + (idx * 3);
  return subcategoryImages[hash % subcategoryImages.length];
};

const CategoryRow = memo(({ category }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1); // 1px buffer for rounding
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [category.subcategories, checkScroll]);

  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.75; // Scroll by 75% of container width
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="relative group">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-medium text-gray-800">{category.name}</h2>
        
        {/* Navigation Arrows in Top Right */}
        <div className="flex items-center space-x-2 mr-2">
          <button 
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${canScrollLeft ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${canScrollRight ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-6 md:gap-12 pb-4 scrollbar-hide snap-x px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.subcategories && category.subcategories.map((sub, idx) => {
          const subName = sub.name || sub;
          const subId = sub.id || sub._id || idx;
          
          return (
            <button
              key={subId}
              type="button"
              onClick={() => navigate(`/sub-category/${subId}`)}
              className="flex flex-col items-center flex-shrink-0 snap-start group w-32 md:w-44 bg-transparent border-0 outline-none text-left"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border border-gray-200 shadow-sm overflow-hidden mb-4 bg-white transition-transform group-hover:shadow-md">
                <img 
                  src={getSubcategoryImage(category.name, subName, idx, sub.image)} 
                  alt={subName}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              </div>
              <span className="text-sm md:text-base text-gray-600 font-normal text-center w-full block">{subName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

CategoryRow.displayName = 'CategoryRow';

// Extracted Header to dynamically measure its own height
const HeaderRow = memo(({ setHeaderHeight }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const height = entries[0].target.offsetHeight;
      setHeaderHeight(height);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setHeaderHeight]);

  return (
    <div ref={ref}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 pb-6 ">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Categories</h1>
        <div className="text-sm text-gray-500 mt-2 md:mt-0 flex items-center">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-1.5 font-bold">&gt;</span>
          <span className="text-gray-600">Categories</span>
        </div>
      </div>
    </div>
  );
});

HeaderRow.displayName = 'HeaderRow';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [headerHeight, setHeaderHeight] = useState(80); // Default guess
  const listRef = useRef(null);

  // Sync Categories with Live Backend API Stream Array
  useEffect(() => {
    const fetchLiveCatalogData = async () => {
      try {
        const response = await getCategoriesAPI();
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Database connection stream failures mapping product catalog grid rows:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveCatalogData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHeaderHeightChange = useCallback((height) => {
    setHeaderHeight((prev) => {
      if (prev !== height) {
        setTimeout(() => {
          if (listRef.current) listRef.current.resetAfterIndex(0);
        }, 0);
        return height;
      }
      return prev;
    });
  }, []);

  // Define dynamic sizes for items
  const getItemSize = useCallback((index) => {
    if (index === 0) return headerHeight;
    return windowWidth < 768 ? 270 : 330;
  }, [headerHeight, windowWidth]);

  // Render individual virtualized row
  const Row = useCallback(({ index, style }) => {
    if (index === 0) {
      return (
        <div style={style}>
          <HeaderRow setHeaderHeight={handleHeaderHeightChange} />
        </div>
      );
    }

    return (
      <div style={style}>
        <div className="pb-10">
          <CategoryRow category={categories[index - 1]} />
        </div>
      </div>
    );
  }, [categories, handleHeaderHeightChange]);

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full px-4">

        {/* Virtualized Categories List Container */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="w-full py-20 flex items-center justify-center text-sm font-semibold text-gray-400">
              Syncing marketplace structures...
            </div>
          ) : categories.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-sm font-semibold text-gray-400">
              <HeaderRow setHeaderHeight={handleHeaderHeightChange} />
              <p className="mt-10">No categories found in the system registry.</p>
            </div>
          ) : (
            <List
              ref={listRef}
              height={windowHeight - 80} 
              itemCount={categories.length + 1}
              itemSize={getItemSize}
              width="100%"
              className="scrollbar-hide"
              style={{ overflowX: 'hidden' }}
            >
              {Row}
            </List>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;