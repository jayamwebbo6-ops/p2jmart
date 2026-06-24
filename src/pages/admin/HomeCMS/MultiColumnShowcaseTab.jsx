import React, { useState, useMemo, useEffect } from 'react';
import { Star, Search, Filter, TrendingUp, ShieldAlert, ArrowRight, Trash2, Layers, Plus, Check, X, Image as ImageIcon } from 'lucide-react';
import { getCategoriesAPI } from '../../../../public/api/categoryApi';
import { getProductsAPI } from '../../../../public/api/productApi';

// Unified Design System Tokens
const THEME = {
  primaryBg: 'bg-[#002B49]',
  primaryText: 'text-[#002B49]',
  primaryHover: 'hover:bg-[#001F35]',
  primaryBorder: 'border-[#002B49]',
  secondaryBg: 'bg-[#F0F8FF]', 
  secondaryText: 'text-[#006699]',
  secondaryBorder: 'border-[#CCE5FF]',
  mutedText: 'text-[#64748b]',
};

const MultiColumnShowcaseTab = ({
  featuredProducts = [],
  setFeaturedProducts,
  trendingProducts = [],
  setTrendingProducts,
  exclusiveProducts = [],
  setExclusiveProducts
}) => {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [targetColumn, setTargetColumn] = useState('featured');
  const [loading, setLoading] = useState(true);

  // Load categories and products from database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await getCategoriesAPI();
        if (catRes && catRes.success) {
          setCategories(catRes.data.map(cat => ({
            ...cat,
            id: cat._id || cat.id,
            subcategories: (cat.subcategories || []).map(sub => ({
              ...sub,
              id: sub._id || sub.id
            }))
          })));
        }

        const prodRes = await getProductsAPI();
        if (prodRes && prodRes.success) {
          setAllProducts(prodRes.data.map(prod => ({
            ...prod,
            id: prod._id || prod.id
          })));
        }
      } catch (err) {
        console.error("Failed to load CMS showcase data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute unique category names for dropdown
  const uniqueCategories = useMemo(() => {
    return ['All', ...categories.map(cat => cat.name)];
  }, [categories]);

  // Compute Subcategories dynamically based on parent category
  const dynamicSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return ['All'];
    const selectedCatObj = categories.find(cat => cat.name === selectedCategory);
    if (!selectedCatObj) return ['All'];
    return ['All', ...(selectedCatObj.subcategories || []).map(sub => sub.name)];
  }, [categories, selectedCategory]);

  // Reset subcategory index when parent switches
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  const handleToggleProductSection = (id) => {
    if (targetColumn === 'featured') {
      if (featuredProducts.includes(id)) {
        setFeaturedProducts(prev => prev.filter(x => x !== id));
      } else {
        setFeaturedProducts(prev => [...prev, id]);
      }
    } else if (targetColumn === 'trending') {
      if (trendingProducts.includes(id)) {
        setTrendingProducts(prev => prev.filter(x => x !== id));
      } else {
        setTrendingProducts(prev => [...prev, id]);
      }
    } else if (targetColumn === 'exclusive') {
      if (exclusiveProducts.includes(id)) {
        setExclusiveProducts(prev => prev.filter(x => x !== id));
      } else {
        setExclusiveProducts(prev => [...prev, id]);
      }
    }
  };

  const handleRemoveFromSection = (id) => {
    setFeaturedProducts(prev => prev.filter(x => x !== id));
    setTrendingProducts(prev => prev.filter(x => x !== id));
    setExclusiveProducts(prev => prev.filter(x => x !== id));
  };

  // Filter Warehouse Inventory Data
  const filteredInventory = useMemo(() => {
    return allProducts.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const catObj = item.category || {};
      const catName = typeof catObj === 'object' ? (catObj.name || '') : catObj;
      const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;

      const subObj = item.subcategory || {};
      const subName = typeof subObj === 'object' ? (subObj.name || '') : subObj;
      const matchesSubcategory = selectedSubcategory === 'All' || subName === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [allProducts, searchQuery, selectedCategory, selectedSubcategory]);

  const columnFeatured = useMemo(() => {
    return featuredProducts
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [featuredProducts, allProducts]);

  const columnTrending = useMemo(() => {
    return trendingProducts
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [trendingProducts, allProducts]);

  const columnExclusive = useMemo(() => {
    return exclusiveProducts
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [exclusiveProducts, allProducts]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#002B49] rounded-full animate-spin"></div>
        <span className="text-xs font-semibold uppercase tracking-wider">Loading showcase...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-8">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className={`text-xl font-black tracking-tight ${THEME.primaryText} uppercase`}>
            Homepage Grid Configuration
          </h1>
          <p className={`text-xs ${THEME.mutedText}`}>Select a layout targets column below, filter your items, and click to add directly to the live view.</p>
        </div>
      </div>

      {/* 2. THREE-COLUMN LIVE FRONTEND PREVIEW PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN A: FEATURED PRODUCTS */}
        <div className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${targetColumn === 'featured' ? 'ring-2 ring-blue-600 border-transparent' : 'border-slate-200'}`}>
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <h3 className={`text-sm font-black ${THEME.primaryText}`}>Featured Products</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                View All <ArrowRight size={10} />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {columnFeatured.map(item => {
                const prodPrice = item.price || (item.variants?.[0]?.price) || 0;
                const prodDiscount = item.discount ? `${item.discount}% OFF` : '';
                const prodImage = item.image || (item.variants?.[0]?.image) || '';
                return (
                  <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                    <div>
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60 flex items-center justify-center">
                        {prodImage ? (
                          <img src={prodImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-350" />
                        )}
                      </div>
                      <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-700">₹{prodPrice}</p>
                      {prodDiscount && (
                        <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 rounded">{prodDiscount}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromSection(item.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {columnFeatured.length === 0 && <p className={`text-center py-8 text-[11px] font-medium ${THEME.mutedText}`}>No items allocated</p>}
        </div>

        {/* COLUMN B: TRENDING COLLECTIONS */}
        <div className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${targetColumn === 'trending' ? 'ring-2 ring-emerald-600 border-transparent' : 'border-slate-200'}`}>
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <h3 className={`text-sm font-black ${THEME.primaryText}`}>Trending Collections</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                View All <ArrowRight size={10} />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {columnTrending.map(item => {
                const prodPrice = item.price || (item.variants?.[0]?.price) || 0;
                const prodDiscount = item.discount ? `${item.discount}% OFF` : '';
                const prodImage = item.image || (item.variants?.[0]?.image) || '';
                return (
                  <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                    <div>
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60 flex items-center justify-center">
                        {prodImage ? (
                          <img src={prodImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-350" />
                        )}
                      </div>
                      <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-700">₹{prodPrice}</p>
                      {prodDiscount && (
                        <p className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">{prodDiscount}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromSection(item.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {columnTrending.length === 0 && <p className={`text-center py-8 text-[11px] font-medium ${THEME.mutedText}`}>No items allocated</p>}
        </div>

        {/* COLUMN C: EXCLUSIVE PRODUCTS */}
        <div className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${targetColumn === 'exclusive' ? 'ring-2 ring-purple-600 border-transparent' : 'border-slate-200'}`}>
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-purple-500" />
                <h3 className={`text-sm font-black ${THEME.primaryText}`}>Exclusive Products</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                View All <ArrowRight size={10} />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {columnExclusive.map(item => {
                const prodPrice = item.price || (item.variants?.[0]?.price) || 0;
                const prodDiscount = item.discount ? `${item.discount}% OFF` : '';
                const prodImage = item.image || (item.variants?.[0]?.image) || '';
                return (
                  <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                    <div>
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60 flex items-center justify-center">
                        {prodImage ? (
                          <img src={prodImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-350" />
                        )}
                      </div>
                      <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-700">₹{prodPrice}</p>
                      {prodDiscount && (
                        <p className="text-[9px] font-black text-purple-600 bg-purple-50 px-1 rounded">{prodDiscount}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromSection(item.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {columnExclusive.length === 0 && <p className={`text-center py-8 text-[11px] font-medium ${THEME.mutedText}`}>No items allocated</p>}
        </div>

      </div>

      {/* 3. CORE INVENTORY DISPATCH CONTROLLER PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
        
        {/* Step 1: Target Destination Choice */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Step 1: Select Active UI Target Destination Column
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTargetColumn('featured')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${targetColumn === 'featured' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <Star size={14} className={targetColumn === 'featured' ? 'fill-amber-400 text-amber-400' : ''} />
              Featured Group
            </button>
            <button
              onClick={() => setTargetColumn('trending')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${targetColumn === 'trending' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <TrendingUp size={14} />
              Trending Group
            </button>
            <button
              onClick={() => setTargetColumn('exclusive')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${targetColumn === 'exclusive' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <ShieldAlert size={14} />
              Exclusive Group
            </button>
          </div>
        </div>

        {/* Filter Management Systems Deck Bar */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className={THEME.secondaryText} />
              <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>
                Step 2: Filter Warehouse Storage Inventory
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center w-full lg:w-auto">
              {/* Search Field */}
              <div className="relative w-full">
                <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.mutedText}`} />
                <input 
                  type="text"
                  placeholder="Search item database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${THEME.secondaryBg} border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all`}
                />
              </div>

              {/* Core Category Dropdown */}
              <div className="relative w-full">
                <Filter size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full ${THEME.secondaryBg} ${THEME.primaryText} border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer appearance-none`}
                >
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Dynamic Subcategory Selection Dropdown */}
              <div className="relative w-full">
                <Layers size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <select
                  value={selectedSubcategory}
                  disabled={selectedCategory === 'All'}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className={`w-full ${selectedCategory === 'All' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 text-emerald-950 border-emerald-100 cursor-pointer'} border rounded-xl pl-9 pr-8 py-2 text-xs font-black uppercase tracking-wider focus:outline-none appearance-none`}
                >
                  {dynamicSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'All' ? 'All Subcategories' : sub}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-600">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Rendered Database Grid Pool */}
          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {filteredInventory.map((item) => {
                const isAssignedToActiveTarget = 
                  (targetColumn === 'featured' && featuredProducts.includes(item.id)) ||
                  (targetColumn === 'trending' && trendingProducts.includes(item.id)) ||
                  (targetColumn === 'exclusive' && exclusiveProducts.includes(item.id));
                
                const prodPrice = item.price || (item.variants?.[0]?.price) || 0;
                const prodDiscount = item.discount ? `${item.discount}% OFF` : '';
                const prodImage = item.image || (item.variants?.[0]?.image) || '';
                const catObj = item.category || {};
                const catLabel = typeof catObj === 'object' ? (catObj.name || '') : catObj;

                return (
                  <div 
                    key={item.id} 
                    className={`border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all duration-150 bg-white shadow-2xs ${
                      isAssignedToActiveTarget 
                        ? 'border-blue-500 ring-2 ring-blue-50 bg-blue-50/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Block: Product Info */}
                    <div className="flex gap-3 items-start">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 flex items-center justify-center">
                        {prodImage ? (
                          <img src={prodImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-350" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className={`text-xs font-black ${THEME.primaryText} leading-snug break-words line-clamp-2`}>
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">
                            {catLabel}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-400 truncate max-w-[80px]">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decoupled Action Bar Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <div>
                        <p className={`text-xs font-black ${THEME.primaryText}`}>₹{prodPrice.toFixed(2)}</p>
                        {prodDiscount && (
                          <p className="text-[9px] font-extrabold text-blue-600">{prodDiscount}</p>
                        )}
                      </div>

                      {isAssignedToActiveTarget ? (
                        <button
                          onClick={() => handleToggleProductSection(item.id)}
                          className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <X size={12} strokeWidth={3} />
                          REMOVE
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleProductSection(item.id)}
                          className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                          ADD ITEM
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredInventory.length === 0 && (
                <div className="col-span-full text-center py-12 text-xs font-medium text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No warehouse products found matching this filter combo setup.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MultiColumnShowcaseTab;