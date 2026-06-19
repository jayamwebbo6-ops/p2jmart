import React, { useState } from 'react';
import { Star, Search, Plus, Link2, Trash2, Check, Filter, Upload, Image as ImageIcon } from 'lucide-react';

// Unified Design System Tokens
const THEME = {
  // Primary: High-importance actions and headers (Midnight Navy)
  primaryBg: 'bg-[#002B49]',
  primaryText: 'text-[#002B49]',
  primaryHover: 'hover:bg-[#001F35]',
  primaryBorder: 'border-[#002B49]',

  // Secondary: Background details, informational banners, and supportive text (Sky Blue/Slate)
  secondaryBg: 'bg-[#F0F8FF]', 
  secondaryText: 'text-[#006699]',
  secondaryBorder: 'border-[#CCE5FF]',
  mutedText: 'text-[#64748b]',
  inputBg: 'bg-white',
};

const ALL_PRODUCTS_DATA = [
  { id: 'SKU-201', name: 'Ele Pro 2', price: 211.00, originalPrice: 222.00, discount: '5% Off', rating: 5, reviews: 15, category: 'Headphones', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60', isFeatured: true },
  { id: 'SKU-202', name: 'Ele 3 Wireless', price: 222.00, originalPrice: 1333.00, discount: '83% Off', rating: 4, reviews: 15, category: 'Headphones', imgUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop&q=60', isFeatured: true },
  { id: 'SKU-203', name: 'Ele Pro 1 Sport', price: 54.00, originalPrice: 55.00, discount: '2% Off', rating: 4, reviews: 15, category: 'Smartwatches', imgUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60', isFeatured: true },
  { id: 'SKU-204', name: 'Ele Pro Max ANC', price: 199.00, originalPrice: 250.00, discount: '20% Off', rating: 5, reviews: 42, category: 'Headphones', imgUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&auto=format&fit=crop&q=60', isFeatured: true }
];

const FeaturedProductsTab = () => {
  const [products, setProducts] = useState(ALL_PRODUCTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Independent state for the Right Side Promo Banner
  const [promoBanner, setPromoBanner] = useState({
    imgUrl: '',
    targetUrl: ''
  });

  // Extract unique categories dynamically from your dataset
  const dynamicCategories = ['All', ...new Set(products.map(p => p.category))];

  const handleToggleFeature = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
  };

  const handlePromoImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPromoBanner(prev => ({ ...prev, imgUrl: url }));
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured);

  // Apply filters for Search and Category simultaneously
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. SECTION HEADER (PRIMARY) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className={`text-xl font-black tracking-tight ${THEME.primaryText} uppercase`}>
            Feature product Manager
          </h1>
          <p className={`text-xs ${THEME.mutedText}`}>Manage featured product carousels and standalone promotional static assets.</p>
        </div>
      </div>

      {/* 2. PROMOTIONAL BANNER CONFIGURATION (SECONDARY THEME) */}
      <div className={`${THEME.secondaryBg} border ${THEME.secondaryBorder} rounded-3xl p-6 shadow-sm space-y-6`}>
        <div className="flex items-center gap-3">
          <div className={`${THEME.primaryBg} p-2 rounded-xl text-white shadow-sm`}>
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>Right Side Promo Banner</h2>
            <p className={`text-[11px] font-medium ${THEME.secondaryText}`}>This image appears as a static advertisement at the end of the product row.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Input Fields */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-black uppercase tracking-widest ${THEME.mutedText}`}>Banner Click-Through URL</label>
              <div className="relative">
                <Link2 size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.mutedText}`} />
                <input 
                  type="text"
                  placeholder="e.g., /offers/mega-sale"
                  value={promoBanner.targetUrl}
                  onChange={(e) => setPromoBanner(prev => ({...prev, targetUrl: e.target.value}))}
                  className={`w-full bg-white border border-slate-200 focus:border-slate-400 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono ${THEME.mutedText} focus:outline-none transition-all shadow-inner`}
                />
              </div>
            </div>
            <p className={`text-[10px] italic ${THEME.mutedText}`}>* Ideal Dimensions: 300px x 500px for consistent vertical alignment.</p>
          </div>

          {/* Upload Bay */}
          <div className="lg:col-span-5">
            <div className="w-full h-44 bg-white/50 border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center group hover:bg-white hover:border-slate-400 transition-all">
              {promoBanner.imgUrl ? (
                <>
                  <img src={promoBanner.imgUrl} alt="Promo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setPromoBanner(prev => ({...prev, imgUrl: ''}))} className="bg-white p-2 rounded-full text-red-600 shadow-xl">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 flex flex-col items-center gap-2">
                  <Upload size={24} className={THEME.secondaryText} />
                  <span className={`text-xs font-bold ${THEME.primaryText}`}>Upload Right Banner Image</span>
                  <span className={`text-[10px] ${THEME.mutedText}`}>Drag and drop or click to browse</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePromoImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE SHOWCASE PREVIEW (PRIMARY THEME) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>Active Product Showcase ({featuredProducts.length})</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <div key={product.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between group hover:bg-white hover:border-slate-200 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-100 relative bg-white">
                  <img src={product.imgUrl} alt={product.name} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 left-2 ${THEME.primaryBg} text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase`}>
                    {product.discount}
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] font-mono font-bold ${THEME.mutedText}`}>{product.id}</span>
                  <h3 className={`text-xs font-black ${THEME.primaryText} truncate`}>{product.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className={`font-mono font-bold ${THEME.secondaryText}`}>₹{product.price.toFixed(2)}</span>
                <button onClick={() => handleToggleFeature(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MASTER INVENTORY FILTER WITH DYNAMIC CATEGORY DROPDOWN */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={16} className={THEME.secondaryText} />
            <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>Inventory Lookup</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
            {/* Search input field wrapper */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.mutedText}`} />
              <input 
                type="text"
                placeholder="Search by SKU or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${THEME.secondaryBg} border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all`}
              />
            </div>

            {/* Category Select Filter Dropdown Panel */}
            <div className="relative w-full sm:w-48">
              <Filter size={12} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.secondaryText}`} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full ${THEME.secondaryBg} ${THEME.primaryText} border border-slate-200 focus:border-slate-400 rounded-xl pl-9 pr-8 py-2 text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer appearance-none`}
              >
                {dynamicCategories.map((cat) => (
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
          </div>
        </div>

        {/* Listings Result Deck Container */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${THEME.mutedText} text-xs font-medium`}>
            No matching items found within selected parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((item) => (
              <div key={item.id} className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${item.isFeatured ? `${THEME.secondaryBg} ${THEME.secondaryBorder}` : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                    <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-black ${THEME.primaryText} truncate`}>{item.name}</h4>
                    <p className={`text-[10px] font-bold ${THEME.secondaryText}`}>₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleFeature(item.id)}
                  className={`text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${item.isFeatured ? `${THEME.primaryBg} text-white` : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {item.isFeatured ? <Check size={12} strokeWidth={4} /> : <Plus size={12} strokeWidth={4} />}
                  {item.isFeatured ? 'FEATURED' : 'FEATURE'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FeaturedProductsTab;