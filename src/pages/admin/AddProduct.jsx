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
import { getCategoriesAPI } from '../../api/categoryApi';
import { getAttributesAPI } from '../../api/attributeApi';
import { getProductsAPI, createProductAPI, updateProductAPI } from '../../api/productApi';
import ConfirmationModal from '../../components/ConfirmationModal';
import { compressAndConvertToWebP } from '../../utils/helpers';

const AttributeDropdown = ({ attr, attrName, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isColor = attrName === 'color';

  const getColorDetails = (term) => {
    let colorName = term;
    let colorHex = '#CCCCCC';
    if (term.includes('|')) {
      const parts = term.split('|');
      colorName = parts[0];
      colorHex = parts[1];
    } else {
      const lower = term.toLowerCase();
      if (lower === 'red') colorHex = '#EF4444';
      else if (lower === 'blue') colorHex = '#3B82F6';
      else if (lower === 'green') colorHex = '#10B981';
      else if (lower === 'purple') colorHex = '#8B5CF6';
      else if (lower === 'orange') colorHex = '#F97316';
      else if (lower === 'brown') colorHex = '#78350F';
      else if (lower === 'yellow') colorHex = '#FBBF24';
      else if (lower === 'white') colorHex = '#FFFFFF';
      else if (lower === 'black') colorHex = '#000000';
    }
    return { name: colorName, hex: colorHex };
  };

  const getDisplayDetails = (term) => {
    if (isColor) {
      return getColorDetails(term);
    }
    return { name: term, hex: null };
  };

  const selectedTerm = attr.terms.find(t => {
    if (isColor) {
      return t.startsWith(value + '|') || t === value;
    }
    return t === value;
  });

  const selectedDetails = value ? getDisplayDetails(selectedTerm || value) : null;

  return (
    <div className="md:col-span-3 flex flex-col gap-1.5 font-bold text-gray-700 relative">
      <label className="text-[10px] font-black text-slate-450 tracking-wider uppercase">
        CHOOSE {attrName} *
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-250 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold cursor-pointer flex items-center justify-between min-h-[34px] select-none"
      >
        {selectedDetails ? (
          <div className="flex items-center gap-2">
            {isColor && (
              <span 
                className="w-3 h-3 rounded-full border border-gray-200 inline-block shrink-0 animate-fadeIn" 
                style={{ backgroundColor: selectedDetails.hex }}
              />
            )}
            <span>{selectedDetails.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 font-normal">Select {attrName}</span>
        )}
        
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          {/* Scroll options enabled by setting max-height (max-h-[200px] holds ~6 items) and overflow-y-auto */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-250 rounded-xl shadow-lg max-h-[200px] overflow-y-auto custom-scrollbar z-40 py-1">
            <div 
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-slate-50 text-xs text-gray-400 font-normal cursor-pointer"
            >
              Select {attrName}
            </div>
            {attr.terms.map(term => {
              const details = getDisplayDetails(term);
              const isSelected = value === details.name;
              
              return (
                <div 
                  key={term}
                  onClick={() => {
                    onChange(details.name);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 hover:bg-slate-50 text-xs cursor-pointer flex items-center gap-2 ${
                    isSelected ? 'bg-blue-50 font-bold text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {isColor && (
                    <span 
                      className="w-3 h-3 rounded-full border border-gray-200 inline-block shrink-0" 
                      style={{ backgroundColor: details.hex }}
                    />
                  )}
                  <span>{details.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

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

  // Catalog state
  const [catalog, setCatalog] = useState([]);
  // Attributes list state
  const [attributesList, setAttributesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected category and subcategory
  const [selectedCatId, setSelectedCatId] = useState(catId);
  const [selectedSubId, setSelectedSubId] = useState(subId);

  // Helper to initialize products map if not present
  const initializeProductsMap = () => {
    const savedCatalog = localStorage.getItem('p2j_mart_catalog');
    let catalogSource = [];
    if (savedCatalog) {
      try {
        catalogSource = JSON.parse(savedCatalog);
      } catch (e) {}
    }
    
    const map = {};
    catalogSource.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        map[sub.id] = sub.products || [];
      });
    });
    return map;
  };

  // Load Categories & Attributes on mount
  const loadCatalogData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available attributes from server
      const attrRes = await getAttributesAPI();
      if (attrRes && attrRes.success) {
        setAttributesList(attrRes.data.map(attr => ({
          id: attr._id,
          _id: attr._id,
          name: attr.name,
          terms: attr.terms
        })));
      }

      // 2. Fetch categories from server
      const catRes = await getCategoriesAPI();
      if (catRes && catRes.success) {
        const backendCats = catRes.data;

        // 3. Fetch products dynamically from server
        let fetchedProducts = [];
        try {
          const prodRes = await getProductsAPI();
          if (prodRes && prodRes.success) {
            fetchedProducts = prodRes.data;
          }
        } catch (e) {
          console.error("Failed to load products from server", e);
        }

        const productsMap = {};
        fetchedProducts.forEach(prod => {
          const subId = prod.subcategory?._id || prod.subcategory?.id || prod.subcategory;
          if (subId) {
            if (!productsMap[subId]) productsMap[subId] = [];
            productsMap[subId].push(prod);
          }
        });

        // Merge products into subcategories
        const mergedCatalog = backendCats.map(cat => ({
          ...cat,
          id: cat._id,
          supportedAttributes: (cat.supportedAttributes || []).map(attr => attr._id || attr.id),
          subcategories: (cat.subcategories || []).map(sub => ({
            ...sub,
            id: sub._id,
            products: productsMap[sub._id] || productsMap[sub.id] || []
          }))
        }));

        setCatalog(mergedCatalog);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load catalog or attribute data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Form states matching user fields
  const [prodForm, setProdForm] = useState({
    title: '',
    description: '',
    brand: '',
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

  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    variantId: null,
    imageIndex: null,
    isMainImage: false
  });

  const handleConfirmDeleteImage = () => {
    const { variantId, imageIndex, isMainImage } = deleteConfirmState;
    
    setProdForm(prev => ({
      ...prev,
      variants: prev.variants.map(item => {
        if (item.id === variantId) {
          if (isMainImage) {
            return { ...item, image: '' };
          } else {
            const updatedImages = item.images.filter((_, i) => i !== imageIndex);
            let newMainImg = item.image;
            if (item.image === item.images[imageIndex]) {
              newMainImg = updatedImages.length > 0 ? updatedImages[0] : '';
            }
            return {
              ...item,
              images: updatedImages,
              image: newMainImg
            };
          }
        }
        return item;
      })
    }));
    
    toast.success("Image removed successfully!");
    setDeleteConfirmState({ isOpen: false, variantId: null, imageIndex: null, isMainImage: false });
  };

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
          brand: foundProd.brand || '',
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

  const calculateDiscount = (price, originalPrice) => {
    const p = parseFloat(price);
    const op = parseFloat(originalPrice);
    if (!isNaN(p) && !isNaN(op) && op > p && op > 0) {
      return Math.round(((op - p) / op) * 100).toString();
    }
    return '0';
  };

  const handleSimplePriceChange = (val) => {
    setProdForm(prev => {
      const updatedVariants = [...(prev.variants || [])];
      if (updatedVariants.length === 0) {
        updatedVariants.push({ id: 'default', attributes: {}, price: val, originalPrice: '', stock: 0 });
      } else {
        updatedVariants[0] = { ...updatedVariants[0], price: val };
      }
      return { ...prev, price: val, variants: updatedVariants };
    });
  };

  const handleSimpleOriginalPriceChange = (val) => {
    setProdForm(prev => {
      const updatedVariants = [...(prev.variants || [])];
      if (updatedVariants.length === 0) {
        updatedVariants.push({ id: 'default', attributes: {}, price: '', originalPrice: val, stock: 0 });
      } else {
        updatedVariants[0] = { ...updatedVariants[0], originalPrice: val };
      }
      return { ...prev, originalPrice: val, variants: updatedVariants };
    });
  };

  const handleSimpleStockChange = (val) => {
    setProdForm(prev => {
      const updatedVariants = [...(prev.variants || [])];
      if (updatedVariants.length === 0) {
        updatedVariants.push({ id: 'default', attributes: {}, price: '', originalPrice: '', stock: val });
      } else {
        updatedVariants[0] = { ...updatedVariants[0], stock: val };
      }
      return { ...prev, variants: updatedVariants };
    });
  };

  // Get active subcategories list
  const activeCategory = catalog.find(c => c.id === selectedCatId);
  const subcategoriesList = activeCategory ? activeCategory.subcategories : [];

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!selectedSubId) return toast.error('Please select a Subcategory');
    if (!prodForm.title.trim()) return toast.error('Product Title is required');
    
    let priceNum = 0;
    let originalPriceNum = null;
    let discountNum = 0;

    // Set product pricing from the first variant
    if (prodForm.variants && prodForm.variants.length > 0) {
      priceNum = parseFloat(prodForm.variants[0].price);
      originalPriceNum = prodForm.variants[0].originalPrice ? parseFloat(prodForm.variants[0].originalPrice) : null;
      if (originalPriceNum && priceNum && originalPriceNum > priceNum) {
        discountNum = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
      }
    } else {
      return toast.error('Please add at least one variant with a valid price.');
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      return toast.error('Please enter a valid price for the product variants.');
    }

    const ratingNum = prodForm.rating.toString().trim() ? parseFloat(prodForm.rating) : 5;
    const reviewsNum = prodForm.reviews.toString().trim() ? parseInt(prodForm.reviews) : 0;

    const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
    let finalImageUrl = prodForm.image.trim();
    if (!finalImageUrl && prodForm.variants && prodForm.variants.length > 0) {
      const firstVar = prodForm.variants[0];
      finalImageUrl = firstVar.image || (firstVar.images && firstVar.images.length > 0 ? firstVar.images[0] : '');
    }
    if (!finalImageUrl) finalImageUrl = defaultImage;

    const productPayload = {
      title: prodForm.title,
      description: prodForm.description,
      brand: prodForm.brand,
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

    setLoading(true);
    const apiPayload = {
      ...productPayload,
      categoryId: selectedCatId,
      subcategoryId: selectedSubId
    };

    try {
      if (isEdit && prodId) {
        const res = await updateProductAPI(prodId, apiPayload);
        if (res && res.success) {
          toast.success('Product updated successfully');
          navigate('/admin/products');
        } else {
          toast.error(res?.message || 'Failed to update product');
        }
      } else {
        const res = await createProductAPI(apiPayload);
        if (res && res.success) {
          toast.success('Product added successfully');
          navigate('/admin/products');
        } else {
          toast.error(res?.message || 'Failed to add product');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save product to database');
    } finally {
      setLoading(false);
    }
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

              {/* Brand Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Brand Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Nike, Apple, generic, etc..."
                  value={prodForm.brand}
                  onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
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

          
            </div>
          )}

          {/* TAB 2: UNIT LIST */}
          {activeTab === 'unit' && (() => {
            const currentCat = catalog.find(c => c.id === selectedCatId);
            const supportedAttrIds = currentCat?.supportedAttributes || [];
            const supportedAttrs = attributesList.filter(a => supportedAttrIds.includes(a.id));

            return (
              <div className="space-y-6 animate-fadeIn">
                {supportedAttrs.length === 0 ? (
                  <div className="bg-slate-50/50 p-5 border border-gray-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        Price (₹) *
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 499"
                        value={prodForm.variants[0]?.price || ''}
                        onChange={(e) => handleSimplePriceChange(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-bold"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        Original Price (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 599"
                        value={prodForm.variants[0]?.originalPrice || ''}
                        onChange={(e) => handleSimpleOriginalPriceChange(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        Quantity (Stock)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 10"
                        value={prodForm.variants[0]?.stock || ''}
                        onChange={(e) => handleSimpleStockChange(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <>
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

                    {showVariantForm && (
                      <div id="variant-builder-form" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-1.5 mb-4">
                          <Plus size={14} className="text-emerald-600" />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {editingVariantId ? 'Edit Selected Product Variant' : '+ 2. ADD MULTIPLE VARIANTS FOR EACH PRODUCT'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          {supportedAttrs.map(attr => {
                            const attrName = attr.name.toLowerCase();
                            return (
                              <AttributeDropdown 
                                key={attr.id}
                                attr={attr}
                                attrName={attrName}
                                value={variantInput.attributes[attrName] || ''}
                                onChange={(val) => setVariantInput(prev => ({
                                  ...prev,
                                  attributes: {
                                    ...prev.attributes,
                                    [attrName]: val
                                  }
                                }))}
                              />
                            );
                          })}

                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 tracking-wider">
                              Price (₹) *
                            </label>
                            <input 
                              type="number"
                              placeholder="e.g. 500"
                              value={variantInput.price}
                              onChange={(e) => setVariantInput(prev => ({ ...prev, price: e.target.value }))}
                              className="w-full border border-gray-200 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-bold"
                            />
                          </div>

                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 tracking-wider">
                              Original Price (₹)
                            </label>
                            <input 
                              type="number"
                              placeholder="e.g. 600"
                              value={variantInput.originalPrice}
                              onChange={(e) => setVariantInput(prev => ({ ...prev, originalPrice: e.target.value }))}
                              className="w-full border border-gray-200 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                            />
                          </div>

                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 tracking-wider">
                              Quantity
                            </label>
                            <input 
                              type="number"
                              placeholder="e.g. 10"
                              value={variantInput.stock}
                              onChange={(e) => setVariantInput(prev => ({ ...prev, stock: e.target.value }))}
                              className="w-full border border-gray-200 px-2.5 py-2 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold"
                            />
                          </div>

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
                    )}

                    {prodForm.variants && prodForm.variants.length > 0 && (
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
                                    const val = v.attributes[attrName];
                                    if (attrName === 'color' && val) {
                                      const term = attr.terms.find(t => t.startsWith(val + '|') || t === val);
                                      let colorHex = '#CCCCCC';
                                      if (term && term.includes('|')) {
                                        colorHex = term.split('|')[1];
                                      } else {
                                        const lower = val.toLowerCase();
                                        if (lower === 'red') colorHex = '#EF4444';
                                        else if (lower === 'blue') colorHex = '#3B82F6';
                                        else if (lower === 'green') colorHex = '#10B981';
                                        else if (lower === 'purple') colorHex = '#8B5CF6';
                                        else if (lower === 'orange') colorHex = '#F97316';
                                        else if (lower === 'brown') colorHex = '#78350F';
                                        else if (lower === 'yellow') colorHex = '#FBBF24';
                                        else if (lower === 'white') colorHex = '#FFFFFF';
                                        else if (lower === 'black') colorHex = '#000000';
                                      }
                                      return (
                                        <td key={attr.id} className="py-4 px-4 capitalize">
                                          <div className="flex items-center gap-2">
                                            <span 
                                              className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block shrink-0" 
                                              style={{ backgroundColor: colorHex }}
                                              title={val}
                                            />
                                            <span>{val}</span>
                                          </div>
                                        </td>
                                      );
                                    }
                                    return (
                                      <td key={attr.id} className="py-4 px-4 capitalize">
                                        {val || '-'}
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
                    )}
                  </>
                )}
              </div>
            );
          })()}

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
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length > 0) {
                                    try {
                                      const promises = files.map(file => compressAndConvertToWebP(file));
                                      const compressedImages = await Promise.all(promises);
                                      
                                      setProdForm(prev => ({
                                        ...prev,
                                        variants: prev.variants.map(item => 
                                          item.id === v.id 
                                            ? { ...item, images: [...(item.images || []), ...compressedImages] }
                                            : item
                                        )
                                      }));
                                      toast.success(`Added ${files.length} image(s) to variant`);
                                    } catch (err) {
                                      toast.error(err.message || 'Failed to process variant images');
                                      e.target.value = '';
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Render uploaded image thumbnails */}
                          <div className="flex flex-wrap gap-4">
                            {(() => {
                              const displayImages = v.images && v.images.length > 0
                                ? v.images
                                : (v.image ? [v.image] : []);

                              if (displayImages.length === 0) {
                                return <span className="text-[11px] text-slate-400 italic">No images uploaded for this variant yet.</span>;
                              }

                              return displayImages.map((img, imgIdx) => {
                                const indexNum = imgIdx + 1;
                                return (
                                  <div key={imgIdx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs group">
                                    <img src={img} alt="variant thumbnail" className="w-full h-full object-cover" />
                                    <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                      {indexNum}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const isMainImage = !(v.images && v.images.length > 0);
                                        setDeleteConfirmState({
                                          isOpen: true,
                                          variantId: v.id,
                                          imageIndex: isMainImage ? null : imgIdx,
                                          isMainImage
                                        });
                                      }}
                                      className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                    >
                                      <Trash2 size={16} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                );
                              });
                            })()}
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
      <ConfirmationModal 
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, variantId: null, imageIndex: null, isMainImage: false })}
        onConfirm={handleConfirmDeleteImage}
        title="Delete Variant Image"
        message="Are you sure you want to delete this variant image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default AddProduct;
