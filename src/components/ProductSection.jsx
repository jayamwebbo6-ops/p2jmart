import React from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductSection = ({ title, products = [], wishlist = [], onWishlist, onRemoveWishlist, onAddToCart, categorySectionData }) => {
  const navigate = useNavigate();

  const categoryId = categorySectionData?.categoryId;
  const bannerImage = categorySectionData?.bannerImage;

  // Use the clean products array passed down from Home.jsx
  const activeProducts = products;

  // Handle centralized routing to safely feed the parent Category details into SubCategoryPage
  const handleNavigation = (e) => {
    e.preventDefault();
    if (!categoryId) return;
    
    navigate(`/sub-category/${categoryId}`, {
      state: {
        subcategoryId: categoryId,
        categoryId: categoryId,
        subcategoryName: title || "Catalog",
        categoryName: "Shop"
      }
    });
  };

  return (
    <div className="w-full mt-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button 
          onClick={handleNavigation}
          className="flex items-center gap-1.5 text-primary hover:text-secondary transition-colors text-sm font-semibold tracking-wide cursor-pointer bg-transparent border-none"
        >
          <Eye size={18} strokeWidth={2.5} />
          View All
        </button>
      </div>
      
      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Products Grid Context */}
        <div className="flex-1">
          {activeProducts && activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 min-[350px]:grid-cols-2 min-[768px]:grid-cols-4 gap-6">
              {activeProducts.map(product => {
                const productId = product._id || product.id;
                const isSaved = wishlist.some(item => item.id === productId || item._id === productId);

                return (
                  <ProductCard 
                    key={productId} 
                    product={product} 
                    isWishlisted={isSaved}
                    onWishlist={onWishlist}
                    onRemoveWishlist={onRemoveWishlist}
                    onAddToCart={onAddToCart}
                    onClick={() => navigate(`/product/${productId}`, { state: { product } })}
                  />
                );
              })}
            </div>
          ) : (
            /* Safe structural fallback message so you don't just see white space */
            <div className="w-full h-full min-h-[250px] border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50">
              <p className="text-gray-400 text-sm font-medium">No products assigned to this section yet.</p>
              <p className="text-gray-300 text-xs mt-1">Check backend model population sequence for "{title}"</p>
            </div>
          )}
        </div>

        {/* Dynamic Promo Banner Side */}
        <div className="hidden lg:block w-full lg:w-1/4 xl:w-[22%] flex-shrink-0">
          <div 
            onClick={handleNavigation}
            className="w-full h-full min-h-[350px] rounded-lg p-6 flex flex-col items-center text-center relative overflow-hidden group shadow-sm border border-gray-200/60 cursor-pointer bg-gray-100"
          >
            {/* Scrim Overlay for dynamic font contrast rendering */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/5 z-10" />

            {/* REAL BACKEND BANNER IMAGE */}
            {bannerImage ? (
              <img 
                src={bannerImage} 
                alt={`${title} Banner`}
                className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
            )}

            {/* Dynamic Content Interface */}
            <div className="relative z-20 w-full flex flex-col h-full justify-between items-center text-white">
              <div className="flex flex-col items-center mt-2">
                <h3 className="text-white text-3xl mb-1 tracking-wide drop-shadow-md font-bold">
                  {title || "Collection"}
                </h3>
                <p className="text-gray-100 mb-5 text-xs font-medium tracking-widest drop-shadow-xs">
                  EXPLORE PREMIUM DESIGNS
                </p>
              </div>

             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 const link = categorySectionData?.bannerLink;
                 if (link) {
                   if (link.startsWith('http://') || link.startsWith('https://')) {
                     window.location.href = link;
                   } else {
                     navigate(link);
                   }
                 }
               }} 
               className="mt-auto bg-white text-gray-900 font-bold text-[11px] tracking-wider py-2.5 px-6 shadow-md rounded-xs group-hover:bg-primary group-hover:text-white transition-all uppercase cursor-pointer"
             >
               SHOP NOW
             </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductSection;