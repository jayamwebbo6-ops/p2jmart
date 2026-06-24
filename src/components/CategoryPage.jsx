import React from "react";
import { getHomeCMS } from '../api/homeCms'; // Adjust this import path to your actual api file path
import { useState, useEffect } from 'react';



const CategoryPage = () => {

  const [categoryData, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
      const fetchCategoryData = async () => {
        try {
          const res = await getHomeCMS();
          
          if (res && res.data && Array.isArray(res.data.categoryGrid)) {
            setCategory(res.data.categoryGrid);
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
      <div className="w-full h-full flex flex-col gap-4">
        <div className="w-full flex-1 rounded-lg bg-gray-200 animate-pulse min-h-[120px]" />
        <div className="w-full flex-1 rounded-lg bg-gray-200 animate-pulse min-h-[120px]" />
      </div>
    );
  }

  return (
    // Side screen margins matching ProductSection exactly (w-full max-w-none px-4 sm:px-6 md:px-8)
    <div className="w-full max-w-none px-4 sm:px-6 md:px-0 bg-gray-50 font-sans text-gray-800 antialiased selection:bg-primary selection:text-white flex flex-col gap-4">
      
      <main className="w-full py-2">
        {/* Compressed layout channels gap-3 matching the high-density grid alignment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          {categoryData.map((category) => (
            <div 
              key={category.id} 
              className="group flex flex-col bg-red-200 border border-gray-200 lg:h-80 shadow-xs hover:border-gray-300 transition-colors duration-200"
            >
              
              {/* FIXED TO RECTANGLE SHAPE: Swapped aspect-[4/5] to aspect-[16/10] or aspect-[16/9] for landscape wide blocks */}
              <div className="w-full lg:h-80 aspect-[16/10] bg-gray-100 overflow-hidden relative cursor-pointer border border-gray-200/40">
                
                {/* Smooth high-contrast gradient scrim to guarantee text remains perfectly legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 z-10" />
                
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />

                {/* Content Overlay Layout - Text elements positioned directly inside the image card frame */}
                <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end items-start gap-2.5">
                  
                 

                  <div>
                    {/* Header displaying using high contrast overlay weights directly */}
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-secondary transition-colors duration-200">
                      {category.name}
                    </h2> 

                    {/* Description paragraph condensed neatly over image canvas */}
                    <p className="text-gray-200 font-normal text-xs leading-snug mt-0.5 max-w-xs line-clamp-1">
                      {category.description}
                    </p>
                  </div>

                  {/* Clean bordered button anchor mirroring the look from image_953c3a.jpg */}
                  <button className="px-3 py-1.5 border border-white text-white bg-transparent text-[10px] font-bold tracking-wider uppercase hover:bg-white hover:text-primary transition-colors duration-200 cursor-pointer">
                    View Collection
                  </button>

                </div>
              </div>

            </div>
          ))}
        </div>
      </main>

    </div>
  );
};

export default CategoryPage;