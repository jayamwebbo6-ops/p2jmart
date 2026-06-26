import React, { useState, useEffect } from "react";
import { getHomeCMS } from '../api/homeCms'; 
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  const [categoryData, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await getHomeCMS();
        
        if (res && res.data && Array.isArray(res.data.categoryGrid)) {
          setCategory(res.data.categoryGrid);
        } else if (res && Array.isArray(res.data)) {
          setCategory(res.data);
        } else if (Array.isArray(res)) {
          setCategory(res);
        }
      } catch (error) {
        console.error("Error fetching categoryGrid banners from CMS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 sm:px-6 md:px-0 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg" />
          <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg" />
          <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) return null;

  return (
    <div className="w-full max-w-none  bg-gray-50 font-sans text-gray-800 antialiased selection:bg-primary selection:text-white flex flex-col gap-4">
      
      <main className="w-full py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          {categoryData.map((category, index) => {
            const categoryId = category._id || category.id || category.targetUrl?.split('catId=')[1];

            return (
              <div 
                key={category._id || index} 
                className="group flex flex-col bg-red-200 border border-gray-200 lg:h-80 shadow-xs hover:border-gray-300 transition-colors duration-200"
              >
                
                <div className="w-full lg:h-80 aspect-[16/10] bg-gray-100 overflow-hidden relative border border-gray-200/40">
                  
                  {/* Scrim overlay for font visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 z-10" />
                  
                  <img
                    src={category.image}
                    alt={category.title || "Category Image"}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />

                  {/* Content Overlay Layout */}
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end items-start gap-2.5">
                    
                    <div>
                      <h2 className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-secondary transition-colors duration-200">
                        {category.title || " "}
                      </h2> 

                      <p className="text-gray-200 font-normal text-xs leading-snug mt-0.5 max-w-xs line-clamp-1">
                        {category.description || "Explore collection items"}
                      </p>
                    </div>

                    {/* FIXED: Path target explicitly includes search string fallback queries to prevent identification crashes */}
                    <Link 
                      to={category.targetUrl || `/sub-category?catId=${categoryId}`} 
                      state={{ 
                        subcategoryId: categoryId,
                        categoryId: categoryId, 
                        categoryName: category.title || "Shop",
                        availableSubcategories: category.subcategories || [],
                        subcategoryName: category.title || "Catalog" 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="px-3 py-1.5 border border-white text-white bg-transparent text-[10px] font-bold tracking-wider uppercase hover:bg-white hover:text-primary transition-colors duration-200 text-center inline-block cursor-pointer z-30"
                    >
                      {category.buttonText || button}
                    </Link>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

    </div>
  );
};

export default CategoryPage;