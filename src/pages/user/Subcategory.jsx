import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard"; 
import OfferSlider from "../../components/OfferSlider";
import { getProductsAPI } from "../../api/productApi";

/* ==========================================================================
   ISOLATED SMOOTH PRICE SLIDER SUB-COMPONENT
   ========================================================================== */
const PriceSliderSection = ({ minPrice, maxPrice, absoluteMin = 0, absoluteMax = 100000, onFilterCommit }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinChange = (val) => {
    setLocalMin(val);
  };

  const handleMinBlur = () => {
    let val = Number(localMin);
    if (isNaN(val) || localMin === "") val = absoluteMin;
    val = Math.max(absoluteMin, Math.min(val, Number(localMax)));
    setLocalMin(val);
    onFilterCommit(val, Number(localMax));
  };

  const handleMaxChange = (val) => {
    setLocalMax(val);
  };

  const handleMaxBlur = () => {
    let val = Number(localMax);
    if (isNaN(val) || localMax === "") val = absoluteMax;
    val = Math.max(Number(localMin), Math.min(val, absoluteMax));
    setLocalMax(val);
    onFilterCommit(Number(localMin), val);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      if (type === "min") {
        handleMinBlur();
      } else {
        handleMaxBlur();
      }
    }
  };

  const handleDragEnd = () => {
    onFilterCommit(Number(localMin), Number(localMax));
  };

  const rangeDiff = (absoluteMax - absoluteMin) || 1; 

  const leftPercent = Math.min(100, Math.max(0, ((Number(localMin) - absoluteMin) / rangeDiff) * 100));
  const rightPercent = Math.min(100, Math.max(0, 100 - ((Number(localMax) - absoluteMin) / rangeDiff) * 100));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gray-800 rounded-sm"></div>
        <h3 className="font-bold text-lg text-gray-800">Price (₹)</h3>
      </div>
      <div className="flex gap-4 mb-5">
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <input
            type="number"
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            onBlur={handleMinBlur}
            onKeyDown={(e) => handleKeyDown(e, "min")}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <input
            type="number"
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            onBlur={handleMaxBlur}
            onKeyDown={(e) => handleKeyDown(e, "max")}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
      </div>

      <div className="relative w-full h-2 px-1 mb-2">
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
        <div
          className="absolute h-1 bg-gray-700 top-1/2 -translate-y-1/2"
          style={{ 
            left: `${leftPercent}%`, 
            right: `${rightPercent}%` 
          }}
        ></div>
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          value={Number(localMin) || 0}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), Number(localMax) - 1))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800 [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: Number(localMin) > (absoluteMax - (rangeDiff * 0.15)) ? 5 : 3 }}
        />
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          value={Number(localMax) || 0}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setLocalMax(Math.max(Number(e.target.value), Number(localMin) + 1))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800 [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN SUBCATEGORY PAGE
   ========================================================================== */
const SubCategoryPage = ({ wishlist = [], addToWishlist, removeFromWishlist, onProductClick, isCustomizedPage = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { subcategoryId, subcategoryName, categoryName } = location.state || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minPriceLimit, setMinPriceLimit] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(100);

  const [absolutePriceLimits, setAbsolutePriceLimits] = useState({ min: 0, max: 10000 });
  const [absoluteDiscountLimits, setAbsoluteDiscountLimits] = useState({ min: 0, max: 100 });

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (!isCustomizedPage && !subcategoryId) {
      navigate("/");
      return;
    }

    const fetchSubcategoryCatalog = async () => {
      try {
        setLoading(true);
        
        let response;
        if (isCustomizedPage) {
          response = await getProductsAPI({ customizeProduct: 'Yes' });
        } else {
          response = await getProductsAPI({ subcategoryId: subcategoryId });
        }
        
        let fetchedProducts = [];
        if (response && response.success && Array.isArray(response.data)) {
          fetchedProducts = response.data;
        } else if (response && Array.isArray(response.data)) {
          fetchedProducts = response.data;
        } else if (Array.isArray(response)) {
          fetchedProducts = response;
        }
        setProducts(fetchedProducts);

        if (fetchedProducts.length > 0) {
<<<<<<< HEAD
          const prices = fetchedProducts.map(p => p.price).filter(p => p !== null && p !== undefined);
          const discounts = fetchedProducts.map(p => p.discount || 0);

          const calculatedMinPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const calculatedMaxPrice = prices.length > 0 ? Math.max(...prices) : 10000;
          const calculatedMinDiscount = discounts.length > 0 ? Math.min(...discounts) : 0;
          const calculatedMaxDiscount = discounts.length > 0 ? Math.max(...discounts) : 100;

          setAbsolutePriceLimits({ min: calculatedMinPrice, max: calculatedMaxPrice });
          setMinPrice(calculatedMinPrice);
          setMaxPrice(calculatedMaxPrice);

          setAbsoluteDiscountLimits({ min: calculatedMinDiscount, max: calculatedMaxDiscount });
          setMinDiscount(calculatedMinDiscount);
          setMaxDiscount(calculatedMaxDiscount);
=======
          const prices = fetchedProducts.map(p => p.price).filter(p => typeof p === 'number');
          if (prices.length > 0) {
            const minVal = Math.min(...prices);
            const maxVal = Math.max(...prices);
            
            // Set dynamic limits
            setMinPriceLimit(minVal);
            setMaxPriceLimit(maxVal);
            setMinPrice(minVal);
            setMaxPrice(maxVal);
          }
>>>>>>> c3e24a5a91ce72a293a928fa445a1dd6e71fa60a
        }
      } catch (error) {
        console.error("Error retrieving matching subcategory goods catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategoryCatalog();
  }, [subcategoryId, navigate, isCustomizedPage]);

  const brandsList = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return [...new Set(brands)];
  }, [products]);

  const sizesList = useMemo(() => {
    const sizes = products.map(p => p.size).filter(Boolean);
    return [...new Set(sizes)];
  }, [products]);

  const handleBrandChange = (brandName) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let output = [...products];

    if (selectedBrands.length > 0) {
      output = output.filter(p => selectedBrands.includes(p.brand));
    }
    if (selectedSize) {
      output = output.filter(p => p.size === selectedSize);
    }
    
    output = output.filter(p => {
      const targetPrice = p.price;
      if (targetPrice === null || targetPrice === undefined) return false;
      return targetPrice >= minPrice && targetPrice <= maxPrice;
    });

    output = output.filter(p => (p.discount || 0) >= minDiscount && (p.discount || 0) <= maxDiscount);

    if (sortOption === "price-low-high") {
      output.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price-high-low") {
      output.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === "discount-high") {
      output.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return output;
  }, [products, selectedBrands, selectedSize, minPrice, maxPrice, minDiscount, maxDiscount, sortOption]);

  const FilterContent = () => (
    <div className="flex flex-col gap-6 font-sans">
      <div className="border border-gray-100 rounded-lg bg-white p-4 shadow-xs flex flex-col gap-6">
        <PriceSliderSection 
          minPrice={minPrice} 
          maxPrice={maxPrice}
          absoluteMin={minPriceLimit}
          absoluteMax={maxPriceLimit}
          onFilterCommit={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }} 
        />

        <OfferSlider 
          minDiscount={minDiscount}
          maxDiscount={maxDiscount}
          absoluteMin={absoluteDiscountLimits.min}
          absoluteMax={absoluteDiscountLimits.max}
          onFilterCommit={(min, max) => {
            setMinDiscount(min);
            setMaxDiscount(max);
          }}
        />

        {brandsList.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-800 text-base mb-3">Brand</h3>
            <div className="flex flex-col gap-2.5">
              {brandsList.map((brand) => (
                <label key={brand} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0A2540]"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {sizesList.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-800 text-base mb-3">Size</h3>
            <div className="flex gap-2">
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                  className={`w-9 h-9 font-bold text-xs flex items-center justify-center rounded transition-all border cursor-pointer ${
                    selectedSize === sz ? "bg-[#6C757D] text-white border-[#6C757D]" : "bg-[#6C757D]/10 text-gray-700 border-transparent hover:bg-gray-200"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

<<<<<<< HEAD
        {(selectedBrands.length > 0 || selectedSize !== null || minPrice > absolutePriceLimits.min || maxPrice < absolutePriceLimits.max || minDiscount > absoluteDiscountLimits.min || maxDiscount < absoluteDiscountLimits.max) && (
=======
        {/* CLEAR ALL FILTERS BUTTON */}
        {(selectedBrands.length > 0 || selectedSize !== null || minPrice > minPriceLimit || maxPrice < maxPriceLimit || minDiscount > 0 || maxDiscount < 100) && (
>>>>>>> c3e24a5a91ce72a293a928fa445a1dd6e71fa60a
          <button
            onClick={() => {
              setSelectedBrands([]);
              setSelectedSize(null);
              setMinPrice(minPriceLimit);
              setMaxPrice(maxPriceLimit);
              setMinDiscount(0);
              setMaxDiscount(100);
            }}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded transition-colors uppercase tracking-wider cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full pt-8 max-w-7xl mx-auto min-h-screen bg-[#FDFDFB] text-gray-800 font-sans antialiased px-4">
      
      {/* Page Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium mb-5 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        {isCustomizedPage ? (
          <span className="text-gray-900 font-bold">Customized Products</span>
        ) : (
          <>
            <Link to="/products" className="hover:text-primary transition-colors">
              {categoryName || "Shop"}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">
              {subcategoryName || "Catalog"}
            </span>
          </>
        )}
      </div>

      {/* Page Header */}
      <div className="pb-5 border-b border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {isCustomizedPage ? "Customized Products" : (subcategoryName || "Subcategory Products")}
        </h1>
      </div>

      {/* Control Toolbar Interface */}
      <div className="w-full flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-6">
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 max-w-xs relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none cursor-pointer font-medium"
          >
            <option value="default">Default sorting</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="discount-high">Offer: Highest Discount</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Filter toggle button visible only below 850px */}
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="min-[850px]:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-600 font-medium cursor-pointer"
          >
            Filters
          </button>
          <div className="min-w-[100px] bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-500 font-medium text-center">
            {loading ? "Counting..." : `Showing ${filteredAndSortedProducts.length} Results`}
          </div>
        </div>
      </div>

      {/* Main Page Layout Body */}
      <div className="w-full flex flex-col min-[850px]:flex-row gap-6 items-start">
        {/* Hide Side filter completely when screen width is above 850px */}
        <aside className="hidden min-[880px]:block w-[260px] lg:w-[250px] flex-shrink-0 sticky top-4">
          <FilterContent />
        </aside>

        <div className="flex-grow w-full">
          {loading ? (
            <div className="w-full text-center py-20 text-gray-400 font-medium">
              Loading matching catalog items...
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="w-full text-center py-16 bg-white border border-gray-200 rounded-lg p-6">
              <span className="text-lg font-medium text-gray-400 block mb-1">No products found matching this subcategory</span>
            </div>
          ) : (
            /* Responsive Grid Configuration: 
              - Default (below 670px): grid-cols-2 
              - min-width 670px: min-[670px]:grid-cols-3
              - min-width 1010px: min-[1010px]:grid-cols-4 
            */
            <div className="grid grid-cols-2 min-[670px]:grid-cols-3 min-[1010px]:grid-cols-4 gap-4">
              {filteredAndSortedProducts.map((product) => {
                const productId = product.id || product._id;
                return (
                  <ProductCard 
                    key={productId} 
                    product={product} 
                    isWishlisted={wishlist.some(item => item.id === productId)}
                    onWishlist={addToWishlist}
                    onRemoveWishlist={removeFromWishlist}
                    onClick={() => navigate(`/product/${productId}`, { state: { product } })} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Mobile Filter Drawer - Triggered when side filter is hidden (< 850px) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex min-[880px]:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-0 mr-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-gray-50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
              <h2 className="text-lg font-bold text-gray-800">Filter Products</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500">✕</button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryPage;