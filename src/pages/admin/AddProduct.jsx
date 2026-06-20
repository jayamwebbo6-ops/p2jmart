import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  Percent,
  Star,
  Image as ImageIcon,
  Tag,
  Code,
  Key,
  FileText,
  CheckCircle,
  Truck,
  Plus,
  Trash2,
  Edit3,
  Upload
} from 'lucide-react';
import { toast } from '../../components/toast';
import { EditBtn, DeleteBtn, AddBtn, SaveBtn, CancelBtn, UpdateBtn, PrevBtn, NextBtn } from '../../components/AdminButtons';

const AddProduct = () => {
  const navigate = useNavigate();
  
  // Read query params manually
  const queryParams = new URLSearchParams(window.location.search);
  const isEdit = queryParams.get('edit') === 'true';
  const catId = queryParams.get('catId') || '';
  const subId = queryParams.get('subId') || '';
  const prodId = queryParams.get('prodId') || '';

  // Tab order definition
  const TAB_ORDER = ['basic', 'unit', 'images', 'meta'];

  // Active Tab state
  const [activeTab, setActiveTab] = useState('basic');

  const goNextTab = () => {
    const idx = TAB_ORDER.indexOf(activeTab);
    if (idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
  };

  const goPrevTab = () => {
    const idx = TAB_ORDER.indexOf(activeTab);
    if (idx > 0) setActiveTab(TAB_ORDER[idx - 1]);
  };

  const isFirstTab = TAB_ORDER.indexOf(activeTab) === 0;
  const isLastTab  = TAB_ORDER.indexOf(activeTab) === TAB_ORDER.length - 1;

  // Load catalog
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_catalog');
    return saved ? JSON.parse(saved) : [];
  });

  // Load attributes variation templates
  const [attributesList, setAttributesList] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_attributes');
    return saved ? JSON.parse(saved) : [
      { id: 'attr-1', name: 'color', terms: ['Blue|#0000FF', 'Red|#FF0000', 'Green|#008000', 'Yellow|#FFFF00', 'White|#FFFFFF', 'Black|#000000'] },
      { id: 'attr-2', name: 'material', terms: ['Wood', 'Acrylic', 'Glass', 'Metal', 'Leather'] },
      { id: 'attr-3', name: 'design', terms: ['Minimalist', 'Floral', 'Modern', 'Classic', 'Vintage'] },
      { id: 'attr-4', name: 'size', terms: ['3 inch', '5 inch', '7 inch', 'Small', 'Medium', 'Large'] },
      { id: 'attr-5', name: 'ramsize', terms: ['4GB', '8GB', '16GB', '32GB'] }
    ];
  });

  // Selected category and subcategory
  const [selectedCatId, setSelectedCatId] = useState(catId);
  const [selectedSubId, setSelectedSubId] = useState(subId);

  // Form states matching user fields
  const [prodForm, setProdForm] = useState({
    title: '',
    description: '',
    collection: 'None',
    customizeProduct: 'No',
    customizationType: 'Text',
    warranty: '',
    returnPolicy: 'Select Return Days',
    deliveryMode: '',
    // Unit List Tab
    price: '',
    originalPrice: '',
    discount: '0',
    rating: '5',
    reviews: '0',
    selectedAttributes: {}, // Structure: { color: ['Blue', 'Red'], size: ['Small'] }
    variants: [], // Array of { id, attributes: { color: 'Blue', size: 'Small' }, price, originalPrice, stock, image }
    // Images Details Tab
    image: '',
    // Meta Title Tab
    metaTitle: '',
    // Keywords Tab
    keywords: '',
    // SEO Description
    seoDescription: '',
    // Detailed Description Tab
    detailedDescription: ''
  });

  // State to manage current variant creation input
  const [variantInput, setVariantInput] = useState({
    attributes: {}, // e.g. { color: '', size: '' }
    price: '',
    originalPrice: '',
    stock: '',
    image: ''
  });

  const [editingVariantId, setEditingVariantId] = useState(null);
  const [showVariantForm, setShowVariantForm] = useState(false);

  const handleEditVariant = (variant) => {
    setEditingVariantId(variant.id);
    setVariantInput({
      attributes: { ...variant.attributes },
      price: variant.price.toString(),
      originalPrice: variant.originalPrice ? variant.originalPrice.toString() : '',
      stock: variant.stock.toString(),
      image: variant.image || ''
    });
    setShowVariantForm(true);
  };

  const handleUpdateVariant = () => {
    if (!variantInput.price || parseFloat(variantInput.price) <= 0) {
      return toast.error("Please enter a valid price for the variant");
    }

    setProdForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === editingVariantId 
          ? {
              ...v,
              attributes: { ...variantInput.attributes },
              price: parseFloat(variantInput.price),
              originalPrice: variantInput.originalPrice ? parseFloat(variantInput.originalPrice) : null,
              stock: parseInt(variantInput.stock) || 0,
              image: variantInput.image || v.image
            }
          : v
      )
    }));

    setEditingVariantId(null);
    setShowVariantForm(false);
    setVariantInput({
      attributes: {},
      price: '',
      originalPrice: '',
      stock: '',
      image: ''
    });
    toast.success("Variant updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setShowVariantForm(false);
    setVariantInput({
      attributes: {},
      price: '',
      originalPrice: '',
      stock: '',
      image: ''
    });
  };

  // Find parent category for selected subcategory
  useEffect(() => {
    if (catalog.length > 0 && selectedSubId) {
      const parentCat = catalog.find(cat => 
        cat.subcategories.some(sub => sub.id === selectedSubId)
      );
      if (parentCat) {
        setSelectedCatId(parentCat.id);
      }
    }
  }, [catalog, selectedSubId]);

  // Load product if editing
  useEffect(() => {
    if (isEdit && prodId && catalog.length > 0) {
      let foundProd = null;
      for (const cat of catalog) {
        const sub = cat.subcategories.find(s => s.id === selectedSubId);
        if (sub) {
          const prod = sub.products.find(p => p.id === prodId);
          if (prod) {
            foundProd = prod;
            break;
          }
        }
      }

      if (foundProd) {
        setProdForm({
          title: foundProd.title || '',
          description: foundProd.description || '',
          collection: foundProd.collection || 'None',
          customizeProduct: foundProd.customizeProduct || 'No',
          customizationType: foundProd.customizationType || 'Text',
          warranty: foundProd.warranty || '',
          returnPolicy: foundProd.returnPolicy || 'Select Return Days',
          deliveryMode: foundProd.deliveryMode || '',
          price: foundProd.price !== undefined ? foundProd.price.toString() : '',
          originalPrice: foundProd.originalPrice !== undefined ? foundProd.originalPrice.toString() : '',
          discount: foundProd.discount !== undefined ? foundProd.discount.toString() : '0',
          image: foundProd.image || '',
          rating: foundProd.rating !== undefined ? foundProd.rating.toString() : '5',
          reviews: foundProd.reviews !== undefined ? foundProd.reviews.toString() : '0',
          selectedAttributes: foundProd.selectedAttributes || {},
          variants: foundProd.variants || [],
          metaTitle: foundProd.metaTitle || '',
          keywords: foundProd.keywords || '',
          seoDescription: foundProd.seoDescription || '',
          detailedDescription: foundProd.detailedDescription || ''
        });
      } else {
        toast.error('Product not found for editing');
      }
    }
  }, [isEdit, prodId, catalog, selectedSubId]);

  const handleAddVariant = () => {
    const currentCat = catalog.find(c => c.id === selectedCatId);
    const supportedAttrIds = currentCat?.supportedAttributes || [];
    const supportedAttrs = attributesList.filter(a => supportedAttrIds.includes(a.id));
    
    for (const attr of supportedAttrs) {
      const attrName = attr.name.toLowerCase();
      if (!variantInput.attributes[attrName]) {
        return toast.error(`Please select a value for "${attr.name}" variation`);
      }
    }
    
    if (!variantInput.price || parseFloat(variantInput.price) <= 0) {
      return toast.error("Please enter a valid price for the variant");
    }
    
    const newVariant = {
      id: `var-${Date.now()}`,
      attributes: { ...variantInput.attributes },
      price: parseFloat(variantInput.price),
      originalPrice: variantInput.originalPrice ? parseFloat(variantInput.originalPrice) : null,
      stock: parseInt(variantInput.stock) || 0,
      images: variantInput.image ? [variantInput.image] : []
    };
    
    setProdForm(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
    
    // Reset inputs
    setVariantInput({
      attributes: {},
      price: '',
      originalPrice: '',
      stock: '',
      image: ''
    });
    toast.success("Variant added successfully!");
  };

  const handleRemoveVariant = (variantId) => {
    setProdForm(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId)
    }));
    toast.success("Variant removed");
  };

  // Get active subcategories list
  const activeCategory = catalog.find(c => c.id === selectedCatId);
  const subcategoriesList = activeCategory ? activeCategory.subcategories : [];

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!selectedSubId) return toast.error('Please select a Subcategory');
    if (!prodForm.title.trim()) return toast.error('Product Title is required');
    if (!prodForm.price.toString().trim()) return toast.error('Price is required in the Unit List Tab');

    const priceNum = parseFloat(prodForm.price);
    const originalPriceNum = prodForm.originalPrice.trim() ? parseFloat(prodForm.originalPrice) : null;
    const discountNum = prodForm.discount.trim() ? parseInt(prodForm.discount) : 0;
    const ratingNum = prodForm.rating.trim() ? parseFloat(prodForm.rating) : 5;
    const reviewsNum = prodForm.reviews.trim() ? parseInt(prodForm.reviews) : 0;

    const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
    const finalImageUrl = prodForm.image.trim() || defaultImage;

    let updatedCatalog = [];

    const productPayload = {
      title: prodForm.title,
      description: prodForm.description,
      collection: prodForm.collection,
      customizeProduct: prodForm.customizeProduct,
      customizationType: prodForm.customizeProduct === 'Yes' ? prodForm.customizationType : null,
      warranty: prodForm.warranty,
      returnPolicy: prodForm.returnPolicy,
      deliveryMode: prodForm.deliveryMode,
      price: priceNum,
      originalPrice: originalPriceNum,
      discount: discountNum,
      image: finalImageUrl,
      rating: ratingNum,
      reviews: reviewsNum,
      selectedAttributes: prodForm.selectedAttributes,
      variants: prodForm.variants || [],
      metaTitle: prodForm.metaTitle,
      keywords: prodForm.keywords,
      seoDescription: prodForm.seoDescription,
      detailedDescription: prodForm.detailedDescription
    };

    if (isEdit && prodId) {
      // Edit Mode
      updatedCatalog = catalog.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id === selectedSubId) {
            return {
              ...sub,
              products: sub.products.map(p => 
                p.id === prodId 
                  ? { 
                      ...p, 
                      ...productPayload
                    } 
                  : p
              )
            };
          }
          return sub;
        })
      }));
      toast.success('Product updated successfully');
    } else {
      // Add Mode
      const newProd = {
        id: `prod-${Date.now()}`,
        ...productPayload
      };

      updatedCatalog = catalog.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id === selectedSubId) {
            return {
              ...sub,
              products: [...sub.products, newProd]
            };
          }
          return sub;
        })
      }));
      toast.success('Product added successfully');
    }

    localStorage.setItem('p2j_mart_catalog', JSON.stringify(updatedCatalog));
    navigate('/admin/products');
  };

  // Return policy days dropdown helper
  const returnPolicyOptions = [
    'Select Return Days',
    'No Return Policy',
    '1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days',
    '8 days', '9 days', '10 days', '11 days', '12 days', '13 days', '14 days', '15 days',
    '30 days', '45 days', '60 days'
  ];

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-200 rounded-lg text-[#001E3C] transition-colors border border-gray-200 bg-white shadow-sm"
          title="Back to Products"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#001E3C] tracking-tight">
            {isEdit ? 'Edit Product Details' : 'Add New Product'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEdit ? 'Modify configuration parameters for this product.' : 'Configure pricing, meta fields, and descriptions for a new storefront product.'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden max-w-5xl">
        
        {/* Category & Subcategory pre-selection block (Always Visible at Top) */}
        <div className="bg-slate-50/50 p-6 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-blue-600" /> Category Destination
            </label>
            <select 
              value={selectedCatId}
              onChange={(e) => {
                setSelectedCatId(e.target.value);
                setSelectedSubId('');
              }}
              className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-bold cursor-pointer"
              disabled={isEdit}
              required
            >
              <option value="">Select Category</option>
              {catalog.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-blue-600" /> Subcategory Target
            </label>
            <select 
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-bold cursor-pointer"
              disabled={isEdit || !selectedCatId}
              required
            >
              <option value="">Select Subcategory</option>
              {subcategoriesList.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Headers Row */}
        <div className="flex flex-wrap border-b border-gray-200 bg-slate-50/20">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'basic' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50/50'
            }`}
          >
            <Package size={14} />
            Basic Details
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('unit')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'unit' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50/50'
            }`}
          >
            <Code size={14} />
            Unit List
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'images' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50/50'
            }`}
          >
            <ImageIcon size={14} />
            Images Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'meta' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50/50'
            }`}
          >
            <Key size={14} />
             Meta Title
          </button>

        
       
        </div>

        {/* Tab Contents Form */}
        <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-6">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Name
                </label>
                <input 
                  type="text" 
                  placeholder="Product title"
                  value={prodForm.title}
                  onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea 
                  placeholder="Write a brief overview of the product..."
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium resize-none"
                />
              </div>

          

              {/* Customize Product (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Customize Product (Optional)
                </label>
                <div className="flex gap-4 mt-1">
                  {['No', 'Yes'].map(option => (
                    <label key={option} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="customizeProduct"
                        value={option}
                        checked={prodForm.customizeProduct === option}
                        onChange={(e) => setProdForm({ ...prodForm, customizeProduct: e.target.value })}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Customization Type — shown only when Customize Product = Yes */}
              {prodForm.customizeProduct === 'Yes' && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Customization Type
                  </label>
                  <div className="flex gap-6 mt-1">
                    {['Text', 'Image', 'Both'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="customizationType"
                          value={type}
                          checked={prodForm.customizationType === type}
                          onChange={(e) => setProdForm({ ...prodForm, customizationType: e.target.value })}
                          className="w-4 h-4 text-blue-600 border-gray-300"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Warranty
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Year Manufacturer Warranty"
                  value={prodForm.warranty}
                  onChange={(e) => setProdForm({ ...prodForm, warranty: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                />
              </div>

              {/* Return Policy */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Return Policy *
                </label>
                <select 
                  value={prodForm.returnPolicy}
                  onChange={(e) => setProdForm({ ...prodForm, returnPolicy: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2.5 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold cursor-pointer text-gray-700"
                >
                  {returnPolicyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400 italic">
                  Number of days customer can return the product after delivery
                </span>
              </div>

              {/* Delivery Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Delivery Mode
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Home Delivery"
                  value={prodForm.deliveryMode}
                  onChange={(e) => setProdForm({ ...prodForm, deliveryMode: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 2: UNIT LIST */}
          {activeTab === 'unit' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Product Variants Header Block */}
              {(() => {
                const currentCat = catalog.find(c => c.id === selectedCatId);
                const supportedAttrIds = currentCat?.supportedAttributes || [];
                const supportedAttrs = attributesList.filter(a => supportedAttrIds.includes(a.id));

                return (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Product Variants
                    </h3>
                    <AddBtn
                      type="button"
                      onClick={() => {
                        setShowVariantForm(!showVariantForm);
                        if (!showVariantForm) {
                          setTimeout(() => {
                            document.getElementById('variant-builder-form')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                    >
                      Add Variant
                    </AddBtn>
                  </div>
                );
              })()}

              {/* Step B: Add Product Variant Form (Toggleable Card) */}
              {showVariantForm && (() => {
                const currentCat = catalog.find(c => c.id === selectedCatId);
                const supportedAttrIds = currentCat?.supportedAttributes || [];
                const supportedAttrs = attributesList.filter(a => supportedAttrIds.includes(a.id));

                if (supportedAttrs.length === 0) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-400 italic">
                        This category has no configured variant attributes. Go to "Product Management" and edit Category "{currentCat?.name || ''}" to enable them.
                      </p>
                    </div>
                  );
                }

                return (
                  <div id="variant-builder-form" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-1.5 mb-4">
                      <Plus size={14} className="text-emerald-600" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {editingVariantId ? 'Edit Selected Product Variant' : '+ 2. ADD MULTIPLE VARIANTS FOR EACH PRODUCT'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Dynamic dropdown selectors for category supported attributes */}
                      {supportedAttrs.map(attr => {
                        const attrName = attr.name.toLowerCase();

                        return (
                          <div key={attr.id} className="md:col-span-3 flex flex-col gap-1.5 font-bold text-gray-700">
                            <label className="text-[10px] font-black text-slate-450 tracking-wider capitalize">
                              CHOOSE {attrName} *
                            </label>
                            <select 
                              value={variantInput.attributes[attrName] || ''}
                              onChange={(e) => setVariantInput(prev => ({
                                ...prev,
                                attributes: {
                                  ...prev.attributes,
                                  [attrName]: e.target.value
                                }
                              }))}
                              className="w-full border border-gray-250 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold cursor-pointer"
                            >
                              <option value="">Select {attrName}</option>
                              {attr.terms.map(term => {
                                let displayName = term;
                                if (attrName === 'color' && term.includes('|')) {
                                  displayName = term.split('|')[0];
                                }
                                return (
                                  <option key={term} value={displayName}>
                                    {displayName}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        );
                      })}

                      {/* Variant Price */}
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-455 tracking-wider">
                          Price (₹) *
                        </label>
                        <input 
                          type="number"
                          placeholder="e.g. 500"
                          value={variantInput.price}
                          onChange={(e) => setVariantInput(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full border border-gray-255 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-bold"
                        />
                      </div>

                      {/* Variant Original Price */}
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-455 tracking-wider">
                          Original Price (₹)
                        </label>
                        <input 
                          type="number"
                          placeholder="e.g. 600"
                          value={variantInput.originalPrice}
                          onChange={(e) => setVariantInput(prev => ({ ...prev, originalPrice: e.target.value }))}
                          className="w-full border border-gray-255 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                        />
                      </div>

                      {/* Variant Stock */}
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-455 tracking-wider">
                          Quantity
                        </label>
                        <input 
                          type="number"
                          placeholder="e.g. 10"
                          value={variantInput.stock}
                          onChange={(e) => setVariantInput(prev => ({ ...prev, stock: e.target.value }))}
                          className="w-full border border-gray-255 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                        />
                      </div>

                      {/* Actions Buttons */}
                      <div className="md:col-span-3 flex gap-2">
                        {editingVariantId ? (
                          <>
                            <UpdateBtn onClick={handleUpdateVariant}>Update</UpdateBtn>
                            <CancelBtn onClick={handleCancelEdit} className="py-2 px-3" />
                          </>
                        ) : (
                          <SaveBtn type="button" onClick={handleAddVariant} className="w-full justify-center py-2">Save</SaveBtn>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Step C: Added Variants Table List */}
              {(() => {
                const currentCat = catalog.find(c => c.id === selectedCatId);
                const supportedAttrIds = currentCat?.supportedAttributes || [];
                const supportedAttrs = attributesList.filter(a => supportedAttrIds.includes(a.id));

                if (!prodForm.variants || prodForm.variants.length === 0) return null;

                return (
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            {supportedAttrs.map(attr => (
                              <th key={attr.id} className="py-3 px-4 capitalize font-semibold">{attr.name}</th>
                            ))}
                            <th className="py-3 px-4 font-semibold">Price (₹)</th>
                            <th className="py-3 px-4 font-semibold">Original Price (₹)</th>
                            <th className="py-3 px-4 font-semibold">Quantity</th>
                            <th className="py-3 px-4 text-right pr-6 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {prodForm.variants.map((v, vIdx) => (
                            <tr key={v.id || vIdx} className="hover:bg-slate-50/30 transition-colors">
                              {supportedAttrs.map(attr => {
                                const attrName = attr.name.toLowerCase();
                                return (
                                  <td key={attr.id} className="py-4 px-4 capitalize">
                                    {v.attributes[attrName] || '-'}
                                  </td>
                                );
                              })}
                              <td className="py-4 px-4 text-slate-900 font-semibold">
                                ₹{v.price}
                              </td>
                              <td className="py-4 px-4 text-slate-500">
                                {v.originalPrice ? `₹${v.originalPrice}` : '-'}
                              </td>
                              <td className="py-4 px-4 text-slate-600">
                                {v.stock}
                              </td>
                              <td className="py-4 px-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                  <EditBtn size={14} onClick={() => handleEditVariant(v)} title="Edit Variant" />
                                  <DeleteBtn size={14} onClick={() => handleRemoveVariant(v.id)} title="Remove Variant" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: IMAGES DETAILS */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-fadeIn">
              {(!prodForm.variants || prodForm.variants.length === 0) ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <ImageIcon size={24} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">
                    No variants created yet.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Please go to the <strong>Unit List</strong> tab and add at least one product variant first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Variant Images Manager
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {prodForm.variants.map((v, idx) => {
                      const attrLabel = Object.entries(v.attributes)
                        .map(([k, val]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${val}`)
                        .join(', ');

                      return (
                        <div key={v.id || idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {attrLabel || 'Default Variant'}
                              </span>
                            </div>
                            
                            <label className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                              <Upload size={14} /> Add Variant Images
                              <input 
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length > 0) {
                                    const loadedImages = [];
                                    let processed = 0;
                                    files.forEach(file => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        loadedImages.push(reader.result);
                                        processed++;
                                        if (processed === files.length) {
                                          setProdForm(prev => ({
                                            ...prev,
                                            variants: prev.variants.map(item => 
                                              item.id === v.id 
                                                ? { ...item, images: [...(item.images || []), ...loadedImages] }
                                                : item
                                            )
                                          }));
                                          toast.success(`Added ${files.length} image(s) to variant`);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Render uploaded image thumbnails */}
                          <div className="flex flex-wrap gap-4">
                            {/* If old main image exists, include it as index 1 */}
                            {v.image && (
                              <div className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs group">
                                <img src={v.image} alt="variant main thumbnail" className="w-full h-full object-cover" />
                                <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                  1
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setProdForm(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(item => 
                                        item.id === v.id 
                                          ? { ...item, image: '' }
                                          : item
                                      )
                                    }));
                                    toast.success("Image removed");
                                  }}
                                  className="absolute inset-0 bg-red-655/80 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Delete
                                </button>
                              </div>
                            )}

                            {v.images && v.images.map((img, imgIdx) => {
                              // If there is a main image, start indexing after it
                              const indexNum = v.image ? imgIdx + 2 : imgIdx + 1;
                              return (
                                <div key={imgIdx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs group">
                                  <img src={img} alt="variant thumbnail" className="w-full h-full object-cover" />
                                  <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {indexNum}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setProdForm(prev => ({
                                        ...prev,
                                        variants: prev.variants.map(item => 
                                          item.id === v.id 
                                            ? { ...item, images: item.images.filter((_, i) => i !== imgIdx) }
                                            : item
                                        )
                                      }));
                                      toast.success("Image removed");
                                    }}
                                    className="absolute inset-0 bg-red-655/80 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    Delete
                                  </button>
                                </div>
                              );
                            })}
                            {(!v.image && (!v.images || v.images.length === 0)) && (
                              <span className="text-[11px] text-slate-400 italic">No images uploaded for this variant yet.</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: META / SEO */}
          {activeTab === 'meta' && (
            <div className="space-y-5 animate-fadeIn">

              {/* Row 1: SEO Title + Meta Keywords side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* SEO Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter SEO title"
                    value={prodForm.metaTitle}
                    onChange={(e) => setProdForm({ ...prodForm, metaTitle: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm rounded-2xl focus:ring-2 focus:ring-blue-300 outline-none bg-white text-slate-600 placeholder-slate-300 transition-all"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., t-shirt, cotton, casual, fashion"
                    value={prodForm.keywords}
                    onChange={(e) => setProdForm({ ...prodForm, keywords: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm rounded-2xl focus:ring-2 focus:ring-blue-300 outline-none bg-white text-slate-600 placeholder-slate-300 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: SEO Description full-width */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  SEO Description
                </label>
                <textarea
                  placeholder="Enter SEO description for better search visibility"
                  rows={4}
                  value={prodForm.seoDescription}
                  onChange={(e) => setProdForm({ ...prodForm, seoDescription: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 text-sm rounded-2xl focus:ring-2 focus:ring-blue-300 outline-none bg-white text-slate-600 placeholder-slate-300 resize-none transition-all"
                />
              </div>

            </div>
          )}

      

          {/* TAB 6: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Detailed Description (HTML or Long Text)
                </label>
                <textarea 
                  placeholder="Provide rich details, instructions, sizing specifications, and other information about this product..."
                  rows={6}
                  value={prodForm.detailedDescription}
                  onChange={(e) => setProdForm({ ...prodForm, detailedDescription: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium resize-y"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer — Next / Prev / Save */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-150 pt-5 mt-4">
            {/* Left side: Cancel + Prev */}
            <div className="flex items-center gap-2">
              <CancelBtn onClick={() => navigate('/admin/products')} />
              {!isFirstTab && (
                <PrevBtn onClick={goPrevTab} />
              )}
            </div>

            {/* Right side: Next or Save */}
            <div className="flex items-center gap-2">
              {!isLastTab ? (
                <NextBtn onClick={goNextTab} />
              ) : (
                <SaveBtn type="submit">Save Product</SaveBtn>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
