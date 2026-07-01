import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Trash2, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Layers, 
  ArrowUp, 
  ArrowDown,
  Layout,
  PlusCircle,
  Eye,
  Link2
} from 'lucide-react';
import { getCategoriesAPI } from '../../../api/categoryApi';
import { getProductsAPI } from '../../../api/productApi';

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

const CategoryTab = ({ sections = [], setSections, askConfirmation }) => {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQueries, setSearchQueries] = useState({});
  const [loading, setLoading] = useState(true);

  // Load categories and products from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await getCategoriesAPI();
        if (catRes && catRes.success) {
          setCategories(catRes.data.map(cat => ({
            ...cat,
            id: String(cat._id || cat.id || ''),
            subcategories: (cat.subcategories || []).map(sub => ({
              ...sub,
              id: String(sub._id || sub.id || '')
            }))
          })));
        }

        const prodRes = await getProductsAPI();
        if (prodRes && prodRes.success) {
          setAllProducts(prodRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch catalog data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveSections = (updatedSections) => {
    setSections(updatedSections);
  };

  const handleAddSection = () => {
    const firstCat = categories[0];
    const newSection = {
      id: `sec-${Date.now()}`,
      categoryId: firstCat?.id ? String(firstCat.id) : '',
      title: firstCat?.name || 'New Showcase',
      bannerImage: '', 
      bannerLink: firstCat?.id ? `/subCategory?catId=${firstCat.id}` : '',
      productIds: []
    };
    saveSections([...sections, newSection]);
  };

  const handleDeleteSection = (id) => {
    askConfirmation({
      title: "Delete Category Section",
      message: "Are you sure you want to delete this category showcase section? This action cannot be undone.",
      onConfirm: () => {
        saveSections(sections.filter(sec => sec.id !== id));
      }
    });
  };

  const handleCategoryChange = (sectionId, catId) => {
    const stringCatId = String(catId || '');
    const selectedCat = categories.find(c => String(c.id) === stringCatId);
    saveSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          categoryId: stringCatId,
          title: selectedCat ? selectedCat.name : '',
          bannerLink: stringCatId ? `/subCategory?catId=${stringCatId}` : '',
          productIds: []
        };
      }
      return sec;
    }));
  };

  const handleUpdateSectionProp = (sectionId, key, value) => {
    saveSections(sections.map(sec =>
      sec.id === sectionId ? { ...sec, [key]: value } : sec
    ));
  };

  const handleBannerUpload = (e, sectionId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updatedSections = sections.map(sec =>
        sec.id === sectionId ? { ...sec, bannerImage: base64String } : sec
      );
      saveSections(updatedSections);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddProductToSection = (sectionId, prodId) => {
    const targetId = String(prodId);
    saveSections(sections.map(sec => {
      if (sec.id === sectionId) {
        const sanitizedIds = (sec.productIds || []).map(id => String(id));
        if (sanitizedIds.includes(targetId)) return sec;
        return { ...sec, productIds: [...sanitizedIds, targetId] };
      }
      return sec;
    }));
  };

  const handleRemoveProductFromSection = (sectionId, prodId) => {
    const targetId = String(prodId);
    saveSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return { 
          ...sec, 
          productIds: (sec.productIds || []).filter(id => String(id) !== targetId) 
        };
      }
      return sec;
    }));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    saveSections(updated);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    saveSections(updated);
  };

  // FRONTEND PERMANENT IMAGE PARSER FIX
  // FRONTEND MULTI-PARSER IMAGE FIX (Leaves server.js untouched)
  // FRONTEND FIX: Custom path parser aligning to server.js without modifications
  const getProductImage = (prod) => {
    if (!prod) return '';
    
    // 1. Prioritize picking the first image array index [0] from the first variant item
    let rawImage = prod.variants?.[0]?.images?.[0] || 
                    prod.variants?.[0]?.image ||
                    prod.image || 
                    prod.images?.[0] || 
                    prod.imagePath || 
                    (Array.isArray(prod.imagePath) ? prod.imagePath[0] : null);

    // Unpack object wrappers if any API middleware intercepts it as an object
    if (rawImage && typeof rawImage === 'object') {
      rawImage = rawImage.url || rawImage.secure_url || rawImage.path || '';
    }

    if (typeof rawImage !== 'string' || !rawImage) return '';

    // If it's already an absolute external web URL link, bypass operations
    if (rawImage.startsWith('http')) {
      return rawImage;
    }

    // 2. Resolve the path mismatch:
    // Strip out duplicated structural references so the path cleanly passes through your server routing
    let structuralPath = rawImage;
    if (structuralPath.startsWith('/')) {
      structuralPath = structuralPath.substring(1);
    }
    
    // If the database path starts with 'uploads/', strip it away 
    // because your server.js route '/api/uploads' already points directly inside that folder.
    if (structuralPath.startsWith('uploads/')) {
      structuralPath = structuralPath.replace('uploads/', '');
    }

    // 3. Construct the clean URL that matches your exact Express app.use('/api/uploads') mount configuration
    const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    return `${base.replace(/\/$/, '')}/uploads/${structuralPath}`;
  };




  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#002B49] rounded-full animate-spin"></div>
        <span className="text-xs font-semibold uppercase tracking-wider">Loading catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-2xs">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${THEME.primaryText} flex items-center gap-2`}>
            <Layout size={18} className="text-blue-600" />
            Category Showcase Sections
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose a Category, pick products, and upload a promotional banner image.
          </p>
        </div>
        <button 
          onClick={handleAddSection}
          className="flex items-center gap-2 bg-[#002B49] hover:bg-[#001F35] text-white font-bold tracking-wider text-xs px-4 py-2.5 rounded-xl uppercase transition-all shadow-sm cursor-pointer"
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
            const targetSectionCatId = String(section.categoryId || '');

            // Robust validation matching both string IDs and populated object IDs smoothly
            const categoryProducts = allProducts.filter(p => {
              if (!p) return false;
              const pCat = p.category;
              const prodCatId = String(
                pCat?.id || pCat?._id || (pCat && typeof pCat === 'object' ? (pCat.id || pCat._id) : '') || pCat || ''
              );
              return prodCatId !== '' && prodCatId === targetSectionCatId;
            });

            const shelfProducts = (section.productIds || [])
              .map(id => allProducts.find(p => String(p?.id || p?._id || '') === String(id)))
              .filter(Boolean);

            const displayProducts = shelfProducts.length > 0 
              ? shelfProducts 
              : categoryProducts.slice(0, 4);

            const filteredPickerProducts = categoryProducts.filter(prod =>
              prod?.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div 
                key={section.id} 
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-[#002B49] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">1. Category</label>
                      <select
                        value={section.categoryId}
                        onChange={(e) => handleCategoryChange(section.id, e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none cursor-pointer"
                      >
                        <option value="">Select Category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

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

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-150 rounded-xl text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ImageIcon size={12} />
                        Promotion Banner (Right Side)
                      </h3>
                      <div className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1.5 rounded-lg font-semibold mt-1 flex items-start gap-1">
                        <span className="shrink-0">ℹ️</span>
                        <span>Recommended: 2:3 Aspect Ratio (Portrait, e.g. 350x520 px) for correct layout display.</span>
                      </div>
                    </div>

                    <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center group hover:bg-slate-100/50 hover:border-slate-300 transition-all">
                      {section.bannerImage ? (
                        <div className="w-full h-full relative">
                          <img 
                            src={section.bannerImage} 
                            alt="Promo Banner Preview" 
                            className="w-full h-full object-cover block" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <button 
                              type="button"
                              onClick={() => handleUpdateSectionProp(section.id, 'bannerImage', '')}
                              className="bg-white p-2 rounded-full text-red-600 hover:text-red-700 shadow-xl cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                          <div className="text-center p-4 flex flex-col items-center gap-2 pointer-events-none">
                            <Upload size={20} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Banner Image</span>
                            <div className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1.5 rounded-lg font-semibold mt-1 flex items-start gap-1">
                              <span className="shrink-0">ℹ️</span>
                              <span>Recommended size: 2:3 Aspect Ratio (Portrait, e.g., 350x520 px) for optimal sidebar layout.</span>
                            </div>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleBannerUpload(e, section.id)} 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Link2 size={10} /> Banner Click Redirect Link
                      </label>
                      <input 
                        type="text"
                        value={section.bannerLink || ''}
                        onChange={(e) => handleUpdateSectionProp(section.id, 'bannerLink', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] bg-slate-50 text-slate-600 font-mono focus:outline-none"
                        placeholder="/subCategory?catId=..."
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers size={12} />
                      Choose Products to Display ({section.productIds?.length || 0} selected)
                    </h3>

                    {!section.categoryId ? (
                      <div className="text-center py-12 bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                        Please select a Category first to list products.
                      </div>
                    ) : categoryProducts.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                        No products found in this category. Add products first.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Search products in this category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQueries({ ...searchQueries, [section.id]: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/20 custom-scrollbar">
                          {filteredPickerProducts.map(prod => {
                            const prodId = prod.id || prod._id;
                            const isSelected = (section.productIds || []).map(id => String(id)).includes(String(prodId));
                            const prodPrice = prod.price || (prod.variants?.[0]?.price) || 0;
                            const prodImage = getProductImage(prod);

                            return (
                              <div 
                                key={prodId}
                                onClick={() => {
                                  if (isSelected) {
                                    handleRemoveProductFromSection(section.id, prodId);
                                  } else {
                                    handleAddProductToSection(section.id, prodId);
                                  }
                                }}
                                className={`border rounded-xl p-2 bg-white transition-all shadow-3xs cursor-pointer relative flex flex-col justify-between select-none ${
                                  isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-slate-150 hover:border-slate-350'
                                }`}
                              >
                                <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center border text-[9px] z-10 ${
                                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-transparent'
                                }`}>
                                  <Check size={10} strokeWidth={3} />
                                </div>

                                <div>
                                  <div className="aspect-square rounded-lg overflow-hidden border border-slate-100 bg-white">
                                    {prodImage ? (
                                      <img src={prodImage} alt={prod.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                        <ImageIcon size={20} />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2 mt-1.5">{prod.title}</h4>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                                  <span className="text-[10px] font-black text-slate-900">₹{Number(prodPrice).toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Eye size={12} className="text-[#006699]" />
                    Live Preview: {section.title || 'Product Showcase Shelf'}
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-4 sm:p-6 font-['Inter']">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{section.title || 'Category Title'}</h3>
                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                        <Eye size={10} /> View All
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {displayProducts.slice(0, 4).map(prod => {
                          if (!prod) return null;
                          const prodPrice = prod.price || (prod.variants?.[0]?.price) || 0;
                          const prodOriginalPrice = prod.originalPrice || (prod.variants?.[0]?.originalPrice) || null;
                          const prodImage = getProductImage(prod);
                          const prodRating = prod.rating || 5;
                          const prodReviews = prod.reviews || 0;

                          return (
                            <div key={prod.id || prod._id} className="bg-white border border-gray-150 rounded-xl p-2.5 flex flex-col justify-between shadow-3xs">
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white">
                                  {prodImage ? (
                                    <img src={prodImage} alt={prod.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                      <ImageIcon size={20} />
                                    </div>
                                  )}
                                </div>
                                <h4 className="text-[10px] font-extrabold text-slate-800 leading-tight line-clamp-2">{prod.title}</h4>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-[10px] font-black text-slate-900">₹{Number(prodPrice).toFixed(2)}</span>
                                  {prodOriginalPrice && (
                                    <span className="text-[8px] text-slate-400 line-through">₹{Number(prodOriginalPrice).toFixed(2)}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  <Star size={8} className="text-amber-400 fill-amber-400" />
                                  <span className="text-[8px] font-bold text-slate-500">{Number(prodRating).toFixed(1)}</span>
                                  <span className="text-[8px] text-slate-400">({prodReviews})</span>
                                </div>
                                <button className="w-full mt-2 bg-[#001E3C] hover:bg-[#002b55] text-white text-[8px] font-extrabold py-1.5 rounded transition-colors uppercase tracking-wider">
                                  Add To Cart
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {Array.from({ length: Math.max(0, 4 - displayProducts.slice(0, 4).length) }).map((_, idx) => (
                          <div key={idx} className="bg-white/40 border border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center text-[9px] text-gray-400 aspect-square">
                            <span>No Product</span>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <div className="w-full h-full min-h-48 rounded-xl overflow-hidden bg-slate-200 relative flex flex-col justify-end p-4 text-white shadow-3xs aspect-[3/5] md:aspect-auto">
                          {section.bannerImage ? (
                            <img 
                              src={section.bannerImage} 
                              alt="Promo Live View Preview" 
                              className="absolute inset-0 w-full h-full object-cover z-0 block" 
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center p-3 text-center z-10">
                              <span className="text-xs font-black uppercase tracking-wider">Upload Banner</span>
                              <span className="text-[9px] font-bold mt-1">Use the uploader above</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-5"></div>
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