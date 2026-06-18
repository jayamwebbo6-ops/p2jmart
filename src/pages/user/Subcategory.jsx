import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "../../components/ProductCard"; 
import OfferSlider from "../../components/OfferSlider"; // Assuming file is saved in same directory

// 1. High-Fidelity Dummy Data Array matching products
const DUMMY_PRODUCTS = [
  {
    id: 1,
    title: "Electronics (Test Product) Curved TV",
    category: "Electronics",
    brand: "Samsung", 
    price: 1113,
    originalPrice: 1200,
    discount: 7,
    rating: 4.2,
    reviews: 15, 
    size: "M",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80"
  },
  {
    id: 2,
    title: "Ele (Test Product) Smart Home Combo",
    category: "Electronics",
    brand: "Philips Hue", 
    price: 500,
    originalPrice: 1500,
    discount: 67,
    rating: 4.5,
    reviews: 15, 
    size: "L",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80"
  },
  {
    id: 3,
    title: "BoAt Rockerz 480, RGB Bluetooth Headphones",
    category: "Accessories",
    brand: "boAt", 
    price: 1799,
    originalPrice: 3750,
    discount: 52,
    rating: 3.8,
    reviews: 15,
    size: "S",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
  },
  {
    id: 5,
    title: "Minimalist Nordic Lounge Chair",
    category: "Chairs",
    brand: "IKEA", 
    price: 3200,
    originalPrice: 4500,
    discount: 28,
    rating: 4.7,
    reviews: 22,
    size: "L",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80"
  },
  {
    id: 6,
    title: "Bespoke Ceramic Desk Task Light",
    category: "Lighting",
    brand: "vivo", 
    price: 850,
    originalPrice: 1200,
    discount: 29,
    rating: 4.0,
    reviews: 9,
    size: "S",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"
  }
];

/* ==========================================================================
   ISOLATED SMOOTH PRICE SLIDER SUB-COMPONENT
   ========================================================================== */
const PriceSliderSection = ({ minPrice, maxPrice, onFilterCommit }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleDragEnd = () => {
    onFilterCommit(localMin, localMax);
  };

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
            onChange={(e) => {
              const val = Math.max(100, Math.min(Number(e.target.value), localMax));
              setLocalMin(val);
              onFilterCommit(val, localMax);
            }}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
        <div className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <input
            type="number"
            value={localMax}
            onChange={(e) => {
              const val = Math.max(localMin, Math.min(Number(e.target.value), 10000));
              setLocalMax(val);
              onFilterCommit(localMin, val);
            }}
            className="w-full outline-none text-gray-700 font-medium bg-transparent"
          />
        </div>
      </div>

      <div className="relative w-full h-2 px-1">
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
        <div
          className="absolute h-1 bg-gray-700 top-1/2 -translate-y-1/2"
          style={{ 
            left: `${((localMin - 100) / (10000 - 100)) * 100}%`, 
            right: `${100 - ((localMax - 100) / (10000 - 100)) * 100}%` 
          }}
        ></div>
        <input
          type="range"
          min="100"
          max="10000"
          value={localMin}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - 50))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800 [&::-webkit-slider-thumb]:pointer-events-auto"
        />
        <input
          type="range"
          min="100"
          max="10000"
          value={localMax}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + 50))}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none cursor-pointer accent-gray-800 [&::-webkit-slider-thumb]:pointer-events-auto"
        />
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN SUBCATEGORY PAGE
   ========================================================================== */
const SubCategoryPage = () => {
  const [sortOption, setSortOption] = useState("default");
  const [minPrice, setMinPrice] = useState(100);
  const [maxPrice, setMaxPrice] = useState(10000);
  
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(100);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categoriesList = ["All", "Electronics", "Lighting", "Tables", "Chairs", "Accessories"];
  const brandsList = ["Samsung", "Philips Hue", "boAt", "IKEA", "vivo"];
  const sizesList = ["M", "L", "S"];

  const handleBrandChange = (brandName) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let output = [...DUMMY_PRODUCTS];

    if (selectedCategory !== "All") {
      output = output.filter(p => p.category === selectedCategory);
    }
    if (selectedBrands.length > 0) {
      output = output.filter(p => selectedBrands.includes(p.brand));
    }
    if (selectedSize) {
      output = output.filter(p => p.size === selectedSize);
    }
    
    output = output.filter(p => {
      if (p.price === null || p.price === undefined) return false;
      return p.price >= minPrice && p.price <= maxPrice;
    });

    output = output.filter(p => p.discount >= minDiscount && p.discount <= maxDiscount);

    if (sortOption === "price-low-high") {
      output.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price-high-low") {
      output.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === "discount-high") {
      output.sort((a, b) => b.discount - a.discount);
    }

    return output;
  }, [selectedCategory, selectedBrands, selectedSize, minPrice, maxPrice, minDiscount, maxDiscount, sortOption]);

  const FilterContent = () => (
    <div className="flex flex-col gap-6 font-sans">
      {/* Categories Panel */}
      <div className="border border-gray-100 rounded-lg bg-white p-4 shadow-xs">
        <div className="flex justify-between items-center font-bold text-gray-800 text-base border-b border-gray-100 pb-2 mb-3">
          <span>Categories</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat ? "bg-[#0A2540] text-white font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parametric Specification Box Container */}
      <div className="border border-gray-100 rounded-lg bg-white p-4 shadow-xs flex flex-col gap-6">
        {/* PRICE RANGE SLIDER */}
        <PriceSliderSection 
          minPrice={minPrice} 
          maxPrice={maxPrice} 
          onFilterCommit={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }} 
        />

        {/* CLEAN REUSED DECOUPLED OFFER FILTER SLIDER COMPONENT */}
        <OfferSlider 
          minDiscount={minDiscount}
          maxDiscount={maxDiscount}
          onFilterCommit={(min, max) => {
            setMinDiscount(min);
            setMaxDiscount(max);
          }}
        />

        {/* BRAND SELECTION BOXES */}
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

        {/* SIZE SELECTION GRID */}
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

        {/* CLEAR ALL FILTERS BUTTON */}
        {(selectedCategory !== "All" || selectedBrands.length > 0 || selectedSize !== null || minPrice > 100 || maxPrice < 10000 || minDiscount > 0 || maxDiscount < 100) && (
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedBrands([]);
              setSelectedSize(null);
              setMinPrice(100);
              setMaxPrice(10000);
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
    <div className="w-full pt-8 max-w-none min-h-screen bg-[#FDFDFB] text-gray-800 font-sans antialiased">
      {/* Control Toolbar Interface Headers Row */}
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
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-600 font-medium cursor-pointer"
          >
            Filters
          </button>
          <div className="min-w-[100px] bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-500 font-medium text-center">
            Showing {filteredAndSortedProducts.length} Results
          </div>
        </div>
      </div>

      {/* Main Page Layout Body */}
      <div className="w-full flex flex-col md:flex-row gap-6 items-start">
        <aside className="hidden md:block w-[260px] lg:w-[290px] flex-shrink-0 sticky top-4">
          <FilterContent />
        </aside>

        <div className="flex-grow w-full">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="w-full text-center py-16 bg-white border border-gray-200 rounded-lg p-6">
              <span className="text-lg font-medium text-gray-400 block mb-1">No products match current parameters</span>
            </div>
          ) : (
            /* PRECISE CUSTOM VIEWPORT GRID TRACKS */
          <div className="grid grid-cols-2 min-[850px]:grid-cols-3 min-[1010px]:grid-cols-4 gap-4">
  {filteredAndSortedProducts.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
          )}
        </div>
      </div>

      {/* Slide-over Mobile Filter Drawer Panel Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
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