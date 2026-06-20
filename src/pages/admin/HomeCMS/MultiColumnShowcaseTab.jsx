import React, { useState, useMemo, useEffect } from 'react';
import { Star, Search, Filter, TrendingUp, ShieldAlert, ArrowRight, RotateCcw, Plus, Trash2, Layers, Check, X } from 'lucide-react';

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

const INITIAL_INVENTORY = [
  // --- ELECTRONICS ---
  { id: 'SKU-001', name: 'Samsung Galaxy C3 Ultra', price: 299.00, discount: '35% OFF', category: 'Electronics', subcategory: 'Smartphones', imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60', displaySection: 'featured' },
  { id: 'SKU-005', name: 'Sony Alpha Pro Sound Kit', price: 199.00, discount: '20% OFF', category: 'Electronics', subcategory: 'Audio Gear', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60', displaySection: 'trending' },
  { id: 'SKU-006', name: 'boAt Rockerz ANC Wireless', price: 59.00, discount: '15% OFF', category: 'Electronics', subcategory: 'Audio Gear', imgUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop&q=60', displaySection: 'trending' },
  { id: 'SKU-007', name: 'Realme GT Neo Edition', price: 249.00, discount: '10% OFF', category: 'Electronics', subcategory: 'Smartphones', imgUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=60', displaySection: 'trending' },
  { id: 'SKU-008', name: 'Apple Watch Series Watch', price: 139.00, discount: '25% OFF', category: 'Electronics', subcategory: 'Wearables', imgUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },
  { id: 'SKU-012', name: 'Premium iPhone Display Plus', price: 899.00, discount: '5% OFF', category: 'Electronics', subcategory: 'Smartphones', imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60', displaySection: 'exclusive' },
  { id: 'SKU-013', name: 'Logitech G Pro Keyboard', price: 129.00, discount: '12% OFF', category: 'Electronics', subcategory: 'PC Peripherals', imgUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },
  { id: 'SKU-014', name: 'Anker PowerCore 24K Pack', price: 49.00, discount: '18% OFF', category: 'Electronics', subcategory: 'Accessories', imgUrl: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },

  // --- APPAREL ---
  { id: 'SKU-002', name: 'Gift Pro Premium Varsity Tee', price: 45.00, discount: '35% OFF', category: 'Apparel', subcategory: 'Menswear', imgUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=60', displaySection: 'featured' },
  { id: 'SKU-010', name: 'Gift Pro 5 Winter Fleece Jacket', price: 75.00, discount: '40% OFF', category: 'Apparel', subcategory: 'Womenswear', imgUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300&auto=format&fit=crop&q=60', displaySection: 'exclusive' },
  { id: 'SKU-015', name: 'AeroFlex Stretch Gym Joggers', price: 39.00, discount: '15% OFF', category: 'Apparel', subcategory: 'Sportswear', imgUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },
  { id: 'SKU-016', name: 'Urban Knit Breathable Sneakers', price: 89.00, discount: '20% OFF', category: 'Apparel', subcategory: 'Footwear', imgUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },

  // --- DECOR ---
  { id: 'SKU-003', name: 'Luxury Horizon Walnut Frame', price: 120.00, discount: '30% OFF', category: 'Decor', subcategory: 'Wall Art', imgUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=60', displaySection: 'featured' },
  { id: 'SKU-011', name: 'Decor Minimalist Ceramic Vase', price: 95.00, discount: '25% OFF', category: 'Decor', subcategory: 'Ornaments', imgUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=60', displaySection: 'exclusive' },
  { id: 'SKU-017', name: 'Nordic Amber Glass Light Base', price: 65.00, discount: '10% OFF', category: 'Decor', subcategory: 'Lighting', imgUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },

  // --- BEAUTY ---
  { id: 'SKU-004', name: 'Glow Beauty Radiance Starter Kit', price: 85.00, discount: '35% OFF', category: 'Beauty', subcategory: 'Skincare', imgUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60', displaySection: 'featured' },
  { id: 'SKU-018', name: 'Velvet Matte Longwear Lip Combo', price: 29.00, discount: '15% OFF', category: 'Beauty', subcategory: 'Cosmetics', imgUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=60', displaySection: 'none' },

  // --- STATIONARY ---
  { id: 'SKU-009', name: 'Classic Leatherbound Journal Set', price: 12.00, discount: '50% OFF', category: 'Stationary', subcategory: 'Notebooks', imgUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=300&auto=format&fit=crop&q=60', displaySection: 'exclusive' },
  { id: 'SKU-019', name: 'Architect Precision Drafting Pens', price: 24.50, discount: '12% OFF', category: 'Stationary', subcategory: 'Writing Tools', imgUrl: 'https://images.unsplash.com/photo-1585336261022-675929945037?w=300&auto=format&fit=crop&q=60', displaySection: 'none' }
];

const MultiColumnShowcaseTab = () => {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [targetColumn, setTargetColumn] = useState('featured');

  // Compute Categories
  const uniqueCategories = useMemo(() => {
    return ['All', ...new Set(inventory.map(item => item.category))];
  }, [inventory]);

  // Compute Subcategories dynamically based on parent category
  const dynamicSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return ['All'];
    const filtered = inventory.filter(item => item.category === selectedCategory);
    return ['All', ...new Set(filtered.map(item => item.subcategory).filter(Boolean))];
  }, [inventory, selectedCategory]);

  // Reset subcategory index when parent switches
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  const handleToggleProductSection = (id) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          displaySection: item.displaySection === targetColumn ? 'none' : targetColumn 
        };
      }
      return item;
    }));
  };

  const handleRemoveFromSection = (id) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, displaySection: 'none' } : item));
  };

 

  // Filter Warehouse Inventory Data Array Matrix
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'All' || item.subcategory === selectedSubcategory;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const columnFeatured = inventory.filter(item => item.displaySection === 'featured');
  const columnTrending = inventory.filter(item => item.displaySection === 'trending');
  const columnExclusive = inventory.filter(item => item.displaySection === 'exclusive');

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
              {columnFeatured.map(item => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                  <div>
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60">
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.name}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-700">₹{item.price}</p>
                    <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 rounded">{item.discount}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromSection(item.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
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
              {columnTrending.map(item => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                  <div>
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60">
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.name}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-700">₹{item.price}</p>
                    <p className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">{item.discount}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromSection(item.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
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
              {columnExclusive.map(item => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative group flex flex-col justify-between h-44">
                  <div>
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-white mb-2 border border-slate-200/60">
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className={`text-[11px] font-black ${THEME.primaryText} leading-tight break-words line-clamp-2`}>{item.name}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-700">₹{item.price}</p>
                    <p className="text-[9px] font-black text-purple-600 bg-purple-50 px-1 rounded">{item.discount}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromSection(item.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
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
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${targetColumn === 'featured' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <Star size={14} className={targetColumn === 'featured' ? 'fill-amber-400 text-amber-400' : ''} />
              Featured Group
            </button>
            <button
              onClick={() => setTargetColumn('trending')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${targetColumn === 'trending' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <TrendingUp size={14} />
              Trending Group
            </button>
            <button
              onClick={() => setTargetColumn('exclusive')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${targetColumn === 'exclusive' ? 'bg-[#002B49] text-white border-transparent shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
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

              {/* Dynamic Subcategory Selection Dropdown Added Here */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {filteredInventory.map((item) => {
              const isAssignedToActiveTarget = item.displaySection === targetColumn;
              
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all duration-150 bg-white shadow-2xs ${
                    isAssignedToActiveTarget 
                      ? 'border-blue-500 ring-2 ring-blue-50 bg-blue-50/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Block: Product Info metadata wrappers layout */}
                  <div className="flex gap-3 items-start">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className={`text-xs font-black ${THEME.primaryText} leading-snug break-words`}>
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">
                          {item.subcategory || item.category}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decoupled Action Bar Row prevents wide truncation blocks */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <p className={`text-xs font-black ${THEME.primaryText}`}>₹{item.price.toFixed(2)}</p>
                      <p className="text-[9px] font-extrabold text-blue-600">{item.discount}</p>
                    </div>

                    {isAssignedToActiveTarget ? (
                      <button
                        onClick={() => handleToggleProductSection(item.id)}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 flex items-center gap-1 transition-all"
                      >
                        <X size={12} strokeWidth={3} />
                        REMOVE
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleProductSection(item.id)}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1 transition-all"
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
  );
};

export default MultiColumnShowcaseTab;