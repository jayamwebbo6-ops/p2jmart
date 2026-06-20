import React, { useState } from 'react';
import { Star, Search, Plus, Link2, Trash2, Check, Filter, Upload, Image as ImageIcon, Layers, X } from 'lucide-react';

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
  inputBg: 'bg-white',
};

// Comprehensive Balanced 20-Product Dataset
const ALL_PRODUCTS_DATA = [
  // --- ELECTRICAL CATEGORY (7 Products) ---
  { id: 'SKU-201', name: 'Ele Pro 2 Over-Ear Headphones', price: 211.00, originalPrice: 222.00, discount: '5% Off', rating: 5, reviews: 15, category: 'Electrical', subcategory: 'Headphones', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60', showcaseGroup: 'electrical' },
  { id: 'SKU-202', name: 'Ele 3 Wireless Earbuds', price: 222.00, originalPrice: 1333.00, discount: '83% Off', rating: 4, reviews: 15, category: 'Electrical', subcategory: 'Wireless Accessories', imgUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-205', name: 'Quantum Soundbar X1', price: 450.00, originalPrice: 500.00, discount: '10% Off', rating: 5, reviews: 88, category: 'Electrical', subcategory: 'Audio Systems', imgUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-206', name: 'Smart Charge Pad Triple', price: 45.00, originalPrice: 60.00, discount: '25% Off', rating: 4, reviews: 112, category: 'Electrical', subcategory: 'Wireless Accessories', imgUrl: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-207', name: 'Studio ANC Headphones 4', price: 299.00, originalPrice: 350.00, discount: '14% Off', rating: 5, reviews: 64, category: 'Electrical', subcategory: 'Headphones', imgUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-216', name: 'VoltStream Power Station', price: 899.00, originalPrice: 999.00, discount: '10% Off', rating: 5, reviews: 32, category: 'Electrical', subcategory: 'Power Grid', imgUrl: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-217', name: 'AeroBlade Desk Fan Pro', price: 79.00, originalPrice: 95.00, discount: '16% Off', rating: 4, reviews: 47, category: 'Electrical', subcategory: 'Home Appliances', imgUrl: 'https://images.unsplash.com/photo-1618945533008-09100242151d?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },

  // --- BOOK TESTING CATEGORY (7 Products) ---
  { id: 'SKU-203', name: 'The Silent Horizon Novel', price: 54.00, originalPrice: 55.00, discount: '2% Off', rating: 4, reviews: 15, category: 'Book Testing', subcategory: 'Fiction', imgUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=60', showcaseGroup: 'book-testing' },
  { id: 'SKU-208', name: 'Advanced React Architecture', price: 89.00, originalPrice: 99.00, discount: '10% Off', rating: 5, reviews: 230, category: 'Book Testing', subcategory: 'Technical Journals', imgUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-209', name: 'Cracking the UX Design Code', price: 42.00, originalPrice: 60.00, discount: '30% Off', rating: 4, reviews: 95, category: 'Book Testing', subcategory: 'Technical Journals', imgUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-210', name: 'Chronicles of the Dark Nebula', price: 19.99, originalPrice: 25.00, discount: '20% Off', rating: 5, reviews: 340, category: 'Book Testing', subcategory: 'Fiction', imgUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-211', name: 'Product Management Playbook', price: 65.00, originalPrice: 75.00, discount: '13% Off', rating: 4, reviews: 41, category: 'Book Testing', subcategory: 'Business Guides', imgUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-218', name: 'Starlight Musings Poetry', price: 24.50, originalPrice: 30.00, discount: '18% Off', rating: 5, reviews: 18, category: 'Book Testing', subcategory: 'Fiction', imgUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-219', name: 'Market Dynamics Strategy', price: 110.00, originalPrice: 150.00, discount: '26% Off', rating: 4, reviews: 53, category: 'Book Testing', subcategory: 'Business Guides', imgUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },

  // --- FASHION JEWELLERY CATEGORY (6 Products) ---
  { id: 'SKU-204', name: 'Ele Pro Max ANC Chain', price: 199.00, originalPrice: 250.00, discount: '20% Off', rating: 5, reviews: 42, category: 'Fashion Jewellery', subcategory: 'Necklaces', imgUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=60', showcaseGroup: 'fashion-jewellery' },
  { id: 'SKU-212', name: 'Classic 18K Gold Bands', price: 320.00, originalPrice: 400.00, discount: '20% Off', rating: 5, reviews: 19, category: 'Fashion Jewellery', subcategory: 'Rings', imgUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-213', name: 'Bohemian Crystal Drops', price: 45.00, originalPrice: 90.00, discount: '50% Off', rating: 4, reviews: 56, category: 'Fashion Jewellery', subcategory: 'Earrings', imgUrl: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-214', name: 'Silver Minimalist Choker', price: 115.00, originalPrice: 130.00, discount: '11% Off', rating: 5, reviews: 8, category: 'Fashion Jewellery', subcategory: 'Necklaces', imgUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-215', name: 'Vintage Emerald Signet Ring', price: 275.00, originalPrice: 300.00, discount: '8% Off', rating: 4, reviews: 24, category: 'Fashion Jewellery', subcategory: 'Rings', imgUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&auto=format&fit=crop&q=60', showcaseGroup: null },
  { id: 'SKU-220', name: 'Diamond Encrusted Studs', price: 599.00, originalPrice: 750.00, discount: '20% Off', rating: 5, reviews: 14, category: 'Fashion Jewellery', subcategory: 'Earrings', imgUrl: 'https://images.unsplash.com/photo-1588444837495-c6cfbf536f84?w=300&auto=format&fit=crop&q=60', showcaseGroup: null }
];

const FeaturedProductsTab = () => {
  const [products, setProducts] = useState(ALL_PRODUCTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Showcase Context State
  const [selectedShowcase, setSelectedShowcase] = useState('book-testing');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Independent Promos State Container Matrix
  const [promoBanners, setPromoBanners] = useState({
    'book-testing': { imgUrl: '', targetUrl: '' },
    'electrical': { imgUrl: '', targetUrl: '' },
    'fashion-jewellery': { imgUrl: '', targetUrl: '' }
  });

  const SHOWCASE_GROUPS = [
    { id: 'book-testing', name: 'Book Testing', categoryMatch: 'Book Testing' },
    { id: 'electrical', name: 'Electrical', categoryMatch: 'Electrical' },
    { id: 'fashion-jewellery', name: 'Fashion Jewellery', categoryMatch: 'Fashion Jewellery' }
  ];

  const currentShowcaseMeta = SHOWCASE_GROUPS.find(g => g.id === selectedShowcase);

  // Dynamic Subcategory Calculation computed directly against current setup choice
  const dynamicSubcategories = React.useMemo(() => {
    const relevantProducts = products.filter(p => p.category === currentShowcaseMeta?.categoryMatch);
    return ['All', ...new Set(relevantProducts.map(p => p.subcategory).filter(Boolean))];
  }, [products, selectedShowcase, currentShowcaseMeta]);

  // Handle auto-reset to avoid dangling invalid subcategory selection states
  React.useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedShowcase]);

  // Toggle dynamic showcase assignments targeting isolated layout scopes
  const handleToggleShowcaseGroup = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          showcaseGroup: p.showcaseGroup === selectedShowcase ? null : selectedShowcase
        };
      }
      return p;
    }));
  };

  const handlePromoImageUpload = (event, groupKey) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPromoBanners(prev => ({
        ...prev,
        [groupKey]: { ...prev[groupKey], imgUrl: url }
      }));
    }
  };

  const updatePromoUrl = (val, groupKey) => {
    setPromoBanners(prev => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], targetUrl: val }
    }));
  };

  // Filter master storage array streams
  const filteredProducts = products.filter(product => {
    const matchesShowcaseCategory = product.category === currentShowcaseMeta?.categoryMatch;
    const matchesSubcategory = selectedSubcategory === 'All' || product.subcategory === selectedSubcategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesShowcaseCategory && matchesSubcategory && matchesSearch;
  });

  // Filter explicitly pinned display array objects
  const currentFeaturedProducts = products.filter(p => p.showcaseGroup === selectedShowcase);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-8">
      
      {/* INVENTORY SEARCH & FILTER ENGINE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={16} className={THEME.secondaryText} />
            <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>Showcase Manager Engine</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 items-center w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full lg:w-56">
              <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.mutedText}`} />
              <input 
                type="text"
                placeholder="Search SKU or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${THEME.secondaryBg} border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all`}
              />
            </div>

            {/* Core Category Filter Selector */}
            <div className="relative w-full lg:w-48">
              <Filter size={12} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.secondaryText}`} />
              <select
                value={selectedShowcase}
                onChange={(e) => setSelectedShowcase(e.target.value)}
                className={`w-full ${THEME.secondaryBg} ${THEME.primaryText} border border-slate-200 focus:border-slate-400 rounded-xl pl-9 pr-8 py-2 text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer appearance-none`}
              >
                {SHOWCASE_GROUPS.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Subcategory Context Selector */}
            <div className="relative w-full lg:w-48">
              <Layers size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full bg-emerald-50 text-emerald-950 border border-emerald-100 focus:border-emerald-300 rounded-xl pl-9 pr-8 py-2 text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
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

        {/* Master Inventory Card Results Display Grid */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${THEME.mutedText} text-xs font-medium`}>
            No products found matching those category criteria pools.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((item) => {
              const isAssignedToCurrent = item.showcaseGroup === selectedShowcase;
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all ${
                    isAssignedToCurrent 
                      ? `${THEME.secondaryBg} ${THEME.secondaryBorder} shadow-sm` 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Info Top Block */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100 shadow-2xs">
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Removed absolute truncates so clean text wraps perfectly */}
                      <h4 className={`text-xs font-extrabold ${THEME.primaryText} leading-snug break-words`}>
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-150/70 text-slate-600 rounded-md font-semibold">
                          {item.subcategory || 'General'}
                        </span>
                        <span className="text-[9px] font-mono font-medium text-slate-400">
                          {item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Actions Block Row split away from top alignment bounds */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                    <p className={`text-xs font-black ${THEME.secondaryText}`}>
                      ₹{item.price.toFixed(2)}
                    </p>

                    {isAssignedToCurrent ? (
                      <button
                        onClick={() => handleToggleShowcaseGroup(item.id)}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 flex items-center gap-1 transition-all"
                      >
                        <X size={12} strokeWidth={3} />
                        REMOVE
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleShowcaseGroup(item.id)}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1 transition-all"
                      >
                        <Plus size={12} strokeWidth={3} />
                        ADD TO SHOWCASE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* DYNAMIC SHOWCASE ACTIVE WORKSPACE VIEW */}
      {currentShowcaseMeta && (
        <div className="space-y-8 animate-fadeIn">
          {/* Section Label Title Header */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className={`text-xl font-black tracking-tight ${THEME.primaryText} uppercase`}>
              {currentShowcaseMeta.name} Channel Workspace
            </h1>
            <p className={`text-xs ${THEME.mutedText}`}>
              Configuring live front-facing layout carousels custom built for the {currentShowcaseMeta.name} category division.
            </p>
          </div>

          {/* Promotional Banner Content Configuration Block */}
          <div className={`${THEME.secondaryBg} border ${THEME.secondaryBorder} rounded-3xl p-6 shadow-sm space-y-6`}>
            <div className="flex items-center gap-3">
              <div className={`${THEME.primaryBg} p-2 rounded-xl text-white shadow-sm`}>
                <ImageIcon size={20} />
              </div>
              <div>
                <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>{currentShowcaseMeta.name} Side Promotion Banner</h2>
                <p className={`text-[11px] font-medium ${THEME.secondaryText}`}>Appears at the absolute terminus tail end of the public layout stream row.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-black uppercase tracking-widest ${THEME.mutedText}`}>Destination Click-Through Link</label>
                  <div className="relative">
                    <Link2 size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME.mutedText}`} />
                    <input 
                      type="text"
                      placeholder="e.g., /offers/mega-sale"
                      value={promoBanners[selectedShowcase].targetUrl}
                      onChange={(e) => updatePromoUrl(e.target.value, selectedShowcase)}
                      className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono text-slate-600 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
                <p className={`text-[10px] italic ${THEME.mutedText}`}>* Ideal Aspect Matrix Target: 300px x 500px dimensions.</p>
              </div>

              <div className="lg:col-span-5">
                <div className="w-full h-44 bg-white/50 border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center group hover:bg-white hover:border-slate-400 transition-all">
                  {promoBanners[selectedShowcase].imgUrl ? (
                    <>
                      <img src={promoBanners[selectedShowcase].imgUrl} alt="Promo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => setPromoBanners(prev => ({ ...prev, [selectedShowcase]: { ...prev[selectedShowcase], imgUrl: '' } }))} className="bg-white p-2 rounded-full text-red-600 shadow-xl">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 flex flex-col items-center gap-2">
                      <Upload size={24} className={THEME.secondaryText} />
                      <span className={`text-xs font-bold ${THEME.primaryText}`}>Upload {currentShowcaseMeta.name} Right Banner Ad</span>
                      <span className={`text-[10px] ${THEME.mutedText}`}>Drag files here or press to search localized storage files</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handlePromoImageUpload(e, selectedShowcase)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Frontend Row Staging Deck Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h2 className={`text-sm font-black uppercase tracking-wider ${THEME.primaryText}`}>{currentShowcaseMeta.name} Active Render Row ({currentFeaturedProducts.length})</h2>
              </div>
            </div>

            {currentFeaturedProducts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-xs text-slate-400 font-medium">
                No active showcase items staged. Use the workspace lookup module above to pin items to this channel group strip.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {currentFeaturedProducts.map((product) => (
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
                        <h3 className="text-xs font-black text-[#002B49] break-words">{product.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className={`font-mono font-bold ${THEME.secondaryText}`}>₹{product.price.toFixed(2)}</span>
                      <button onClick={() => handleToggleShowcaseGroup(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsTab;