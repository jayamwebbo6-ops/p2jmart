import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import { categories } from '../../utils/constants';
import { useNavigate } from "react-router-dom";

// Array of diverse product images to use for subcategories
const subcategoryImages = [
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop', // smartwatch
  'https://images.unsplash.com/photo-1589492477829-5e65395b66ea?q=80&w=200&auto=format&fit=crop', // smart speaker
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=200&auto=format&fit=crop', // white headphones
  'https://images.unsplash.com/photo-1599643478524-fb524451000f?q=80&w=200&auto=format&fit=crop', // jewelry
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop', // gold necklace
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop', // red headphones
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format&fit=crop', // earbuds
  'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=200&auto=format&fit=crop', // portable speaker
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=200&auto=format&fit=crop', // sunglasses
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=200&auto=format&fit=crop', // camera
];

const getSubcategoryImage = (catName, subName, idx) => {
  // Deterministic selection so it stays consistent based on category and subcategory strings
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
    <div className="mb-14 relative group">
      <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-6">{category.name}</h2>
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 -ml-3 md:-ml-5 w-8 h-8 md:w-10 md:h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-md z-10 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      )}
      
      {/* Scroll Right Button */}
      {canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 -mr-3 md:-mr-5 w-8 h-8 md:w-10 md:h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-md z-10 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-6 md:gap-12 pb-4 scrollbar-hide snap-x px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.subcategories.map((sub, idx) => (
          <Link
  key={idx}
  to="/subCategory"
  className="flex flex-col items-center flex-shrink-0 snap-start group w-32 md:w-44"
>
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border border-gray-200 shadow-sm overflow-hidden mb-4 bg-white transition-transform group-hover:shadow-md">
              <img 
                src={getSubcategoryImage(category.name, sub, idx)} 
                alt={sub}
                className="w-full h-full object-contain p-2"
              />

              
            </div>
            <span className="text-sm md:text-base text-gray-600 font-normal text-center">{sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
});

const Products = () => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render individual virtualized row
  const Row = useCallback(({ index, style }) => {
    return (
      <div style={style}>
        <CategoryRow category={categories[index]} />
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen py-8 overflow-hidden flex flex-col">
      {/* Note: Use standard tailwind styles to hide scrollbar if 'scrollbar-hide' plugin is not installed */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-4 px-4 md:px-8 lg:px-12 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Categories</h1>
          <div className="text-sm text-gray-500 mt-2 md:mt-0 flex items-center">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-1.5 font-bold">&gt;</span>
            <span className="text-gray-600">Categories</span>
          </div>
        </div>

        {/* Virtualized Categories List */}
        <div className="flex-1 w-full pl-4 md:pl-8 lg:pl-12">
          <List
            height={windowHeight - 180} // Approx viewport height minus headers/padding
            itemCount={categories.length}
            itemSize={340} // Estimated height of CategoryRow
            width="100%"
            className="scrollbar-hide"
            style={{ overflowX: 'hidden' }}
          >
            {Row}
          </List>
        </div>

      </div>
    </div>
  );
};

export default Products;
