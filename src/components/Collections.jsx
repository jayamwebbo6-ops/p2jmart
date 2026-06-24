import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";
import { getHomeCMS } from '../api/homeCms'; ; 
import { getProductsAPI } from '../api/homeCms'; // Ensure this matches your real master products collection api utility path

const Collections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionsAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch CMS configurations and product items concurrently
        const [cmsRes, productsRes] = await Promise.all([
          getHomeCMS(),
          getProductsAPI()
        ]);

        const cmsData = cmsRes?.data || cmsRes;
        let masterProducts = [];

        if (productsRes && productsRes.success && productsRes.data) {
          masterProducts = productsRes.data;
        } else if (Array.isArray(productsRes)) {
          masterProducts = productsRes;
        }

        if (cmsData && masterProducts.length > 0) {
          // Extract matching raw identification string keys safely
          const featuredIds = cmsData.featuredProducts || [];
          const trendingIds = cmsData.trendingProducts || [];
          const exclusiveIds = cmsData.exclusiveProducts || [];

          // Map string IDs to full product catalog documents
          const populateProducts = (ids) => {
            return ids
              .map(id => masterProducts.find(p => (p._id === id || p._id?.$oid === id || p.id === id)))
              .filter(Boolean);
          };

          setSections([
            {
              title: "Featured Products",
              products: populateProducts(featuredIds),
              fallbackId: featuredIds[0] || ""
            },
            {
              title: "Trending Collections",
              products: populateProducts(trendingIds),
              fallbackId: trendingIds[0] || ""
            },
            {
              title: "Exclusive Products",
              products: populateProducts(exclusiveIds),
              fallbackId: exclusiveIds[0] || ""
            }
          ]);
        }
      } catch (error) {
        console.error("Error populating structural matrices in Collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionsAndProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] pt-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-3 border border-gray-200 animate-pulse h-80 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  // Prevent white screen crashes if data payloads load empty
  if (sections.length === 0 || sections.every(s => s.products.length === 0)) return null;

  return (
    <div className="bg-[#f5f5f5]">
      
      {/* Banner */}
      <section className="bg-primary text-white w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="px-6 py-11 flex flex-col md:flex-row items-center justify-between gap-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Send size={48} className="text-white/60" />
            <div>
              <Link to="/contact">
                <h2 className="text-2xl text-white font-semibold hover:underline">
                  Contact Us now
                </h2>
              </Link>
              <p className="text-sm md:text-base text-gray-200 mt-1">
                Explore Our Products Today to get unbelievable Discounts!!
              </p>
            </div>
          </div>

          <Link to="/products"> 
            <button className="bg-[#2c2c2c] hover:bg-black px-10 py-3 rounded-full text-white font-medium transition">
              Explore Our Products
            </button>
          </Link>
        </div>
      </section>

      {/* Real Live Products Sections */}
      <section className="pt-12 max-w-7xl mx-auto px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {sections.map((section) => {
            if (section.products.length === 0) return null;

            const routeId = section.products[0]?._id?.$oid || section.products[0]?._id || section.fallbackId;

            return (
              <div
                key={section.title}
                className="bg-white border border-gray-200 p-3 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Section Title Header Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-gray-800">
                      {section.title}
                    </h2> 

                    <Link 
                      to={`/subCategory?catId=${routeId}`}
                      state={{ 
                        categoryId: routeId,
                        subcategoryName: section.title,
                        categoryName: section.title 
                      }}
                      className="text-blue-600 text-sm hover:underline font-medium"
                    >
                      View All →
                    </Link>
                  </div>

                  {/* Product Grid Mapping */}
                  <div className="grid grid-cols-2 gap-3">
                    {section.products.slice(0, 4).map((product) => {
                      const productId = product._id?.$oid || product._id || product.id;
                      
                      return (
                        <Link
                          key={productId}
                          to={`/product/${productId}`}
                          className="border border-gray-200 rounded-xs p-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white flex flex-col justify-between group"
                        >
                          <div className="aspect-square bg-gray-50/50 rounded overflow-hidden flex items-center justify-center">
                            <img
                              src={product.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"}
                              alt={product.title || "Product Image"}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain p-1 group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </div>

                          <div className="mt-2 flex items-start justify-between gap-1.5 w-full">
                            {/* REAL CONVENTION: product.name changed to product.title */}
                            <h3 className="text-xs text-gray-700 line-clamp-2 font-medium group-hover:text-primary transition-colors flex-1">
                              {product.title}
                            </h3>

                            {/* REAL CONVENTION: Handles both raw strings and numbers dynamically */}
                            <span className="text-blue-600 text-xs font-semibold whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded-xs">
                              {typeof product.discount === 'number' ? `${product.discount}% OFF` : product.discount || "Sale"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Collections;