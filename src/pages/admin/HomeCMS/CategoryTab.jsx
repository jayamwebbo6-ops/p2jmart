import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Plus, 
  Link2, 
  Trash2, 
  Check, 
  Filter, 
  Upload, 
  Image as ImageIcon, 
  Layers, 
  X, 
  ArrowUp, 
  ArrowDown,
  Layout,
  PlusCircle,
  Eye
} from 'lucide-react';
import { getCategoriesAPI } from '../../../api/categoryApi';
import { toast } from '../../../components/toast';
import { compressAndConvertToWebP } from '../../../utils/helpers';

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

// Fallback initial products in case catalog is empty
const MOCK_PRODUCTS = [
  { id: 'SKU-201', name: 'Premium Wireless Headphones', price: 199.00, originalPrice: 249.00, discount: '20% Off', rating: 4.5, reviews: 28, category: 'Electronics', subcategory: 'Audio', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60' },
  { id: 'SKU-202', name: 'Smart Watch Series 9', price: 299.00, originalPrice: 349.00, discount: '14% Off', rating: 4.8, reviews: 42, category: 'Electronics', subcategory: 'Wearables', imgUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60' },
  { id: 'SKU-203', name: 'Portable Bluetooth Speaker', price: 79.00, originalPrice: 99.00, discount: '20% Off', rating: 4.2, reviews: 19, category: 'Electronics', subcategory: 'Audio', imgUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=60' },
  { id: 'SKU-204', name: 'Minimalist Wall Clock', price: 45.00, originalPrice: 59.00, discount: '23% Off', rating: 4.6, reviews: 14, category: 'Electronics', subcategory: 'Decor', imgUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&auto=format&fit=crop&q=60' },
  { id: 'SKU-205', name: 'Custom Spotify Frame Plaque', price: 500.00, originalPrice: 550.00, discount: '10% Off', rating: 5.0, reviews: 36, category: 'Gift Items', subcategory: 'Personalized Gifts', imgUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=60' },
  { id: 'SKU-206', name: 'Personalized Photo Keychain', price: 120.00, originalPrice: 150.00, discount: '20% Off', rating: 4.7, reviews: 18, category: 'Gift Items', subcategory: 'Keychains', imgUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=60' }
];

const CategoryTab = () => {
  const [catalog, setCatalog] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchQueries, setSearchQueries] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Load catalog and sections
  useEffect(() => {
    const fetchCatalogAndSections = async () => {
      setLoading(true);
      let parsedCatalog = [];
      try {
        const res = await getCategoriesAPI();
        if (res && res.success) {
          const backendCats = res.data;

          // Merge products from productsMap
          let productsMap = {};
          const savedProductsMap = localStorage.getItem('p2j_mart_products_map');
          if (savedProductsMap) {
            productsMap = JSON.parse(savedProductsMap);
          } else {
            const savedCatalog = localStorage.getItem('p2j_mart_catalog');
            const catalogSource = savedCatalog ? JSON.parse(savedCatalog) : [];
            catalogSource.forEach(cat => {
              (cat.subcategories || []).forEach(sub => {
                productsMap[sub.id] = sub.products || [];
              });
            });
            localStorage.setItem('p2j_mart_products_map', JSON.stringify(productsMap));
          }

          parsedCatalog = backendCats.map(cat => ({
            ...cat,
            id: cat._id,
            subcategories: (cat.subcategories || []).map(sub => ({
              ...sub,
              id: sub._id,
              products: productsMap[sub._id] || productsMap[sub.id] || []
            }))
          }));
        }
      } catch (err) {
        console.error("Failed to fetch catalog from server", err);
        const savedCatalog = localStorage.getItem('p2j_mart_catalog');
        if (savedCatalog) {
          try {
            parsedCatalog = JSON.parse(savedCatalog);
          } catch (e) {}
        }
      }

      if (parsedCatalog.length === 0) {
        parsedCatalog = [
          {
            id: 'cat-electronics',
            name: 'Electronics',
            subcategories: [
              { id: 'sub-audio', name: 'Audio', products: MOCK_PRODUCTS.slice(0, 3) },
              { id: 'sub-decor', name: 'Decor', products: [MOCK_PRODUCTS[3]] }
            ]
          },
          {
            id: 'cat-gifts',
            name: 'Gift Items',
            subcategories: [
              { id: 'sub-personalized', name: 'Personalized Gifts', products: [MOCK_PRODUCTS[4]] },
              { id: 'sub-keychains', name: 'Keychains', products: [MOCK_PRODUCTS[5]] }
            ]
          }
        ];
      }

      setCatalog(parsedCatalog);
      localStorage.setItem('p2j_mart_catalog', JSON.stringify(parsedCatalog));

      // Load saved homepage sections
      const savedSections = localStorage.getItem('p2j_mart_category_sections');
      if (savedSections) {
        try {
          setSections(JSON.parse(savedSections));
        } catch (e) {
          console.error("Failed to parse sections", e);
        }
      } else {
        // Default dynamic sections
        const defaultSections = [
          {
            id: `sec-${Date.now()}-1`,
            categoryId: parsedCatalog[0]?.id || '',
            subCategoryId: parsedCatalog[0]?.subcategories[0]?.id || '',
            title: parsedCatalog[0]?.name || 'Electronics Showcase',
            bannerImage: '',
            bannerLink: parsedCatalog[0] ? `/subCategory?catId=${parsedCatalog[0].id}` : '',
            productIds: []
          }
        ];
        setSections(defaultSections);
        localStorage.setItem('p2j_mart_category_sections', JSON.stringify(defaultSections));
      }
      setLoading(false);
    };

    fetchCatalogAndSections();
  }, []);

  // Helper to save sections
  const saveSections = (updatedSections) => {
    setSections(updatedSections);
    localStorage.setItem('p2j_mart_category_sections', JSON.stringify(updatedSections));
    window.dispatchEvent(new Event('home_cms_updated'));
  };

  // Add new section
  const handleAddSection = () => {
    const firstCat = catalog[0];
    const firstSub = firstCat?.subcategories[0];
    
    const newSection = {
      id: `sec-${Date.now()}`,
      categoryId: firstCat?.id || '',
      subCategoryId: firstSub?.id || '',
      title: firstCat?.name || 'New Showcase',
      bannerImage: '',
      bannerLink: firstCat ? `/subCategory?catId=${firstCat.id}` : '',
      productIds: []
    };
    saveSections([...sections, newSection]);
  };

  // Delete section
  const handleDeleteSection = (id) => {
    const updated = sections.filter(sec => sec.id !== id);
    saveSections(updated);
  };

  // Handle Category selection change - Sets dynamic main category title & link
  const handleCategoryChange = (sectionId, catId) => {
    const selectedCat = catalog.find(c => c.id === catId);
    const sub = selectedCat?.subcategories[0];

    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          categoryId: catId,
          subCategoryId: sub ? sub.id : '',
          title: selectedCat ? selectedCat.name : '',
          bannerLink: catId ? `/subCategory?catId=${catId}` : '',
          productIds: [] // Clear previously selected products
        };
      }
      return sec;
    });
    saveSections(updated);
  };

  // Handle Subcategory selection change - Filters product picker only (no link modification)
  const handleSubCategoryChange = (sectionId, subId) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          subCategoryId: subId
        };
      }
      return sec;
    });
    saveSections(updated);
  };

  // Update other section property
  const handleUpdateSectionProp = (sectionId, key, value) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, [key]: value };
      }
      return sec;
    });
    saveSections(updated);
  };

  // Upload local banner image
  const handleBannerUpload = async (e, sectionId) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressAndConvertToWebP(file);
        const updated = sections.map(sec => {
          if (sec.id === sectionId) {
            return { ...sec, bannerImage: compressed };
          }
          return sec;
        });
        saveSections(updated);
      } catch (err) {
        toast.error(err.message || 'Failed to process banner image');
        e.target.value = '';
      }
    }
  };

  // Add product to section shelf
  const handleAddProductToSection = (sectionId, prodId) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        if (sec.productIds.includes(prodId)) return sec;
        return { ...sec, productIds: [...sec.productIds, prodId] };
      }
      return sec;
    });
    saveSections(updated);
  };

  // Remove product from section shelf
  const handleRemoveProductFromSection = (sectionId, prodId) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, productIds: sec.productIds.filter(id => id !== prodId) };
      }
      return sec;
    });
    saveSections(updated);
  };

  // Move up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    saveSections(updated);
  };

  // Move down
  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    saveSections(updated);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* CMS INSTRUCTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-2xs">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${THEME.primaryText} flex items-center gap-2`}>
            <Layout size={18} className="text-blue-600" />
            Category Showcase Sections
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose a Category (for title and link) and filter by Subcategory to choose specific products.
          </p>
        </div>
        <button 
          onClick={handleAddSection}
          className="flex items-center gap-2 bg-[#002B49] hover:bg-[#001F35] text-white font-bold tracking-wider text-xs px-4 py-2.5 rounded-xl uppercase transition-all shadow-sm"
        >
          <PlusCircle size={15} />
          Add Category Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl text-xs text-slate-400 shadow-2xs flex flex-col items-center gap-2">
          <Layout size={32} className="text-slate-300 animate-pulse" />
          <span>No Homepage Category Sections found. Click the button above to add one.</span>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section, index) => {
            const searchQuery = searchQueries[section.id] || '';

            // Find current category and its subcategories from catalog
            const activeCategory = catalog.find(c => c.id === section.categoryId);
            const subcategoriesList = activeCategory ? activeCategory.subcategories : [];

            // Extract all products from all subcategories under the active Category
            const categoryProducts = activeCategory ? activeCategory.subcategories.flatMap(sub => 
              (sub.products || []).map(p => ({
                id: p.id,
                name: p.title,
                price: parseFloat(p.price) || 0,
                originalPrice: parseFloat(p.originalPrice) || null,
                discount: p.discount ? `${p.discount}% Off` : '0% Off',
                rating: parseFloat(p.rating) || 5.0,
                reviews: parseInt(p.reviews) || 0,
                imgUrl: p.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60',
                subCategoryId: sub.id
              }))
            ) : [];

            // Filter products for the active subcategory filter dropdown to display in the inline picker
            const subcategoryProducts = categoryProducts.filter(p => p.subCategoryId === section.subCategoryId);

            // Selected shelf products - resolved category-wide so they persist across subcategory switching
            const shelfProducts = section.productIds
              .map(id => categoryProducts.find(p => p.id === id))
              .filter(Boolean);

            // Fallback display products if none manually selected: take the first 4 products from the active subcategory
            const displayProducts = shelfProducts.length > 0 
              ? shelfProducts 
              : subcategoryProducts.slice(0, 4);

            return (
              <div 
                key={section.id} 
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 hover:border-slate-300 transition-all"
              >
                {/* SECTION SHELF BUILDER CONTROLS */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-[#002B49] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>

                    {/* Category Select Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">1. Category</label>
                      <select
                        value={section.categoryId}
                        onChange={(e) => handleCategoryChange(section.id, e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none cursor-pointer"
                      >
                        <option value="">Select Category...</option>
                        {catalog.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory Select Dropdown (For product choosing only) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">2. Subcategory Filter</label>
                      <select
                        value={section.subCategoryId}
                        onChange={(e) => handleSubCategoryChange(section.id, e.target.value)}
                        disabled={!section.categoryId}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <option value="">Select Subcategory...</option>
                        {subcategoriesList.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title Input field */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Shelf Display Title</label>
                      <input 
                        type="text"
                        placeholder="e.g. Headphones Special"
                        value={section.title || ''}
                        onChange={(e) => handleUpdateSectionProp(section.id, 'title', e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none w-44"
                      />
                    </div>
                  </div>

                  {/* Reordering Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-150 rounded-xl text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* PROMO BANNER & PRODUCTS WORKSPACE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Banner Upload Card */}
                  <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon size={12} />
                      Promotion Banner
                    </h3>

                    <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center group hover:bg-slate-100/50 hover:border-slate-300 transition-all">
                      {section.bannerImage ? (
                        <>
                          <img src={section.bannerImage} alt="Promo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => handleUpdateSectionProp(section.id, 'bannerImage', '')} 
                              className="bg-white p-2 rounded-full text-red-600 hover:text-red-700 shadow-xl"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 flex flex-col items-center gap-2">
                          <Upload size={20} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700">Upload Banner Image</span>
                          <span className="text-[9px] text-slate-400">Drag or click to choose (Local Files)</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleBannerUpload(e, section.id)} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>

                    {/* Destination Link - Automatically prefilled to Main Category */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Link2 size={10} /> Auto Destination Link
                      </label>
                      <input 
                        type="text"
                        readOnly
                        value={section.bannerLink || ''}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] bg-slate-100 text-slate-500 font-mono focus:outline-none select-all"
                        title="This link is auto-populated based on category selection."
                      />
                    </div>
                  </div>

                  {/* Product Picker */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers size={12} />
                      Choose Products to Display
                    </h3>

                    {!section.subCategoryId ? (
                      <div className="text-center py-12 bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                        Please select Category & Subcategory Filter first to list products.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Search / Filter input */}
                        <div className="relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Filter products in this subcategory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQueries({ ...searchQueries, [section.id]: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                          />
                        </div>

                        {/* Checklist Grid */}
                        {subcategoryProducts.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400">No products found in this subcategory.</div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/20 custom-scrollbar">
                            {subcategoryProducts
                              .filter(prod => prod.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(prod => {
                                const isSelected = section.productIds.includes(prod.id);
                                return (
                                  <div 
                                    key={prod.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        handleRemoveProductFromSection(section.id, prod.id);
                                      } else {
                                        handleAddProductToSection(section.id, prod.id);
                                      }
                                    }}
                                    className={`border rounded-xl p-2 bg-white transition-all shadow-3xs cursor-pointer relative flex flex-col justify-between select-none ${
                                      isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-slate-150 hover:border-slate-350'
                                    }`}
                                  >
                                    {/* Selection badge */}
                                    <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center border text-[9px] z-10 ${
                                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-transparent'
                                    }`}>
                                      <Check size={10} strokeWidth={3} />
                                    </div>

                                    <div>
                                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-100 bg-white">
                                        <img src={prod.imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-[8px] font-mono text-slate-400 block mt-1">{prod.id}</span>
                                      <h4 className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2 mt-0.5">{prod.name}</h4>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                                      <span className="text-[10px] font-black text-slate-900">₹{prod.price}</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Eye size={12} className="text-[#006699]" />
                    Live Preview: {section.title || 'Product Showcase Shelf'}
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-4 sm:p-6 font-['Inter']">
                    {/* Shelf Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{section.title || 'Category Title'}</h3>
                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                        <Eye size={10} /> View All
                      </span>
                    </div>

                    {/* Main Layout Preview Row */}
                    <div className="grid grid-cols-12 gap-4">
                      {/* Products */}
                      <div className="col-span-12 md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {displayProducts.map(prod => (
                          <div key={prod.id} className="bg-white border border-gray-150 rounded-xl p-2.5 flex flex-col justify-between shadow-3xs">
                            <div className="space-y-2">
                              <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white">
                                <img src={prod.imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                              </div>
                              <h4 className="text-[10px] font-extrabold text-slate-800 leading-tight line-clamp-2">{prod.name}</h4>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-black text-slate-900">₹{prod.price.toFixed(2)}</span>
                                {prod.originalPrice && (
                                  <span className="text-[8px] text-slate-400 line-through">₹{prod.originalPrice.toFixed(2)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <Star size={8} className="text-amber-400 fill-amber-400" />
                                <span className="text-[8px] font-bold text-slate-500">{prod.rating.toFixed(1)}</span>
                                <span className="text-[8px] text-slate-400">({prod.reviews})</span>
                              </div>
                              <button className="w-full mt-2 bg-[#001E3C] hover:bg-[#002b55] text-white text-[8px] font-extrabold py-1.5 rounded transition-colors uppercase tracking-wider">
                                Add To Cart
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Fillers */}
                        {Array.from({ length: Math.max(0, 4 - displayProducts.length) }).map((_, idx) => (
                          <div key={idx} className="bg-white/40 border border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center text-[9px] text-gray-400 aspect-square">
                            <span>No Product</span>
                          </div>
                        ))}
                      </div>

                      {/* Side Banner Card */}
                      <div className="col-span-12 md:col-span-3">
                        <div className="w-full h-full min-h-48 rounded-xl overflow-hidden bg-slate-200 relative flex flex-col justify-end p-4 text-white shadow-3xs aspect-[3/5] md:aspect-auto">
                          {section.bannerImage ? (
                            <img src={section.bannerImage} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center p-3 text-center">
                              <span className="text-xs font-black uppercase tracking-wider">Mega Sale</span>
                              <span className="text-[9px] font-bold mt-1">UP TO 30% OFF</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0"></div>
                          
                          <div className="relative z-10 text-center w-full space-y-1">
                            <span className="text-[8px] font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full uppercase inline-block">Special Offer</span>
                            <button className="w-full bg-white text-slate-900 text-[8px] font-black py-1.5 rounded-lg uppercase tracking-wider transition-all">
                              Shop Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryTab;
