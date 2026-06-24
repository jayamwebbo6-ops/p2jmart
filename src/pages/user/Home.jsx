import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import HeroBanner from '../../components/HeroBanner';
import PromoBanners from '../../components/PromoBanners';
import ProductSection from '../../components/ProductSection';
import CategoryPage from '../../components/CategoryPage';
import Collections from '../../components/Collections';
import { useLazySection } from '../../utils/helpers';
import { getHomeCMS } from '../../../public/api/homeCms'; 
import { getProductsAPI } from '../../../public/api/productApi'; // 1. IMPORT YOUR PRODUCTS FETCH UTILITY

const SectionSkeleton = ({ height = '300px' }) => (
  <div className="w-full animate-pulse rounded-lg overflow-hidden" style={{ minHeight: height }}>
    <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg" 
      style={{ minHeight: height, backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} 
    />
  </div>
);

const Home = ({ wishlist = [], addToWishlist, removeFromWishlist, onAddToCart }) => {
  const [cmsData, setCmsData] = useState({ categorySections: [] });
  const [allProducts, setAllProducts] = useState([]); // 2. STORE MASTER PRODUCT CATALOG
  const [loading, setLoading] = useState(true);

  const [productRef, isProductVisible] = useLazySection('300px');
  const [categoryRef, isCategoryVisible] = useLazySection('250px');
  const [collectionsRef, isCollectionsVisible] = useLazySection('250px');

  useEffect(() => {
    const fetchHomeAndProducts = async () => {
      try {
        setLoading(true);
        
        // 3. FETCH BOTH CMS DATA AND PRODUCTS SIMULTANEOUSLY
        const [cmsRes, productsRes] = await Promise.all([
          getHomeCMS(),
          getProductsAPI() 
        ]);

        // Handle Master Products list extraction
        if (productsRes && productsRes.success && productsRes.data) {
          setAllProducts(productsRes.data);
        } else if (Array.isArray(productsRes)) {
          setAllProducts(productsRes);
        }

        // Handle CMS layout extraction
        if (cmsRes && cmsRes.success && cmsRes.data) {
          setCmsData(cmsRes.data);
        } else if (cmsRes && cmsRes.categorySections) {
          setCmsData(cmsRes);
        }
      } catch (error) {
        console.error("Error loading frontend storefront matrices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeAndProducts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Top Row Layout */}
      <div className="w-full flex flex-col lg:flex-row gap-5 mt-7.5">
        <div className="hidden lg:block lg:w-1/4 xl:w-[22%] flex-shrink-0 lg:h-[460px]">
          <Sidebar />
        </div>
        <div className="w-full lg:flex-1 h-[350px] md:h-[400px] lg:h-[460px]">
          <HeroBanner />
        </div>
        <div className="w-full lg:w-1/4 xl:w-[22%] flex-shrink-0 flex flex-col min-[360px]:flex-row lg:flex-col gap-5">
          <PromoBanners />
        </div>
      </div>

      {/* Product Section Layout Box */}
      <div ref={productRef} className="w-full flex flex-col gap-10">
        {isProductVisible ? (
          <>
            {cmsData?.categorySections && cmsData.categorySections.map((section, idx) => {
              // 4. FRONTEND POPULATION: Match the string IDs to full product objects
              const rawIds = section.productIds || [];
              const matchedProducts = rawIds.map(id => {
                // Find matching product by checking both id or _id structures
                return allProducts.find(p => (p._id === id || p.id === id));
              }).filter(Boolean); // Clears unmatched items safely

              return (
                <ProductSection 
                  key={section.categoryId || idx}
                  title={section.title || "Collection"} 
                  products={matchedProducts} // Pass populated array down
                  categorySectionData={section}
                  wishlist={wishlist}
                  onWishlist={addToWishlist}
                  onRemoveWishlist={removeFromWishlist} 
                  onAddToCart={onAddToCart}
                />
              );
            })}

            {(!cmsData?.categorySections || cmsData.categorySections.length === 0) && !loading && (
              <div className="w-full text-center py-10 text-gray-400 font-medium">
                No active home storefront product sections found.
              </div>
            )}
          </>
        ) : (
          <SectionSkeleton height="420px" />
        )}
      </div>

      {/* Category & Collections Sections */}
      <div ref={categoryRef}>
        {isCategoryVisible ? <CategoryPage /> : <SectionSkeleton height="320px" />}
      </div>

      <div ref={collectionsRef}>
        {isCollectionsVisible ? <Collections /> : <SectionSkeleton height="500px" />}
      </div>
    </div>
  );
};

export default Home;