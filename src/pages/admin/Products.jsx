import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Search, 
  FolderPlus, 
  Package, 
  Folder, 
  LayoutGrid, 
  X, 
  Image, 
  Tag, 
  DollarSign, 
  Percent, 
  Star,
  Maximize2,
  Minimize2,
  Eye
} from 'lucide-react';
import { toast } from '../../components/toast';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { EditBtn, DeleteBtn, AddBtn, SaveBtn, CancelBtn, ViewBtn, PrimaryBtn } from '../../components/AdminButtons';
import AdminTable from '../../components/AdminTable';
import PageHeader from '../../components/PageHeader';
import { compressAndConvertToWebP } from '../../utils/helpers';
import { 
  getCategoriesAPI, 
  createCategoryAPI, 
  updateCategoryAPI, 
  deleteCategoryAPI,
  createSubcategoryAPI,
  updateSubcategoryAPI,
  deleteSubcategoryAPI 
} from '../../../public/api/categoryApi';
import { getAttributesAPI } from '../../../public/api/attributeApi';
import { getProductsAPI, deleteProductAPI } from '../../../public/api/productApi';

// Initial pre-populated catalog tree data matching user theme


const Products = () => {
  const navigate = useNavigate();
  
  const getProductDisplayImage = (prod) => {
    if (prod.variants && prod.variants.length > 0) {
      const firstVar = prod.variants[0];
      if (firstVar.image) return firstVar.image;
      if (firstVar.images && firstVar.images.length > 0) return firstVar.images[0];
    }
    if (prod.image) return prod.image;
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
  };

  const [catalog, setCatalog] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  
  // Active selections
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Preview Modal States
  const [previewProduct, setPreviewProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const handleViewProduct = (product) => {
    setPreviewProduct(product);
    setActiveImageIndex(0);
    setSelectedVariantIndex(0);
  };

  // Confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  // Modals state
  const [modalType, setModalType] = useState(null); // 'cat' | 'sub' | 'prod'
  const [editItem, setEditItem] = useState(null); // Item to edit (null if adding)
  const [parentId, setParentId] = useState(null); // Parent category/subcategory id

  // Form states
  const [catForm, setCatForm] = useState({ name: '', image: '', supportedAttributes: [] });
  const [subForm, setSubForm] = useState({ name: '', image: '' });
  const [prodForm, setProdForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '0',
    image: '',
    rating: '5',
    reviews: '0'
  });

  // Helper to initialize products map if not present
  const initializeProductsMap = () => {
    const savedCatalog = localStorage.getItem('p2j_mart_catalog');
    const catalogSource = savedCatalog ? JSON.parse(savedCatalog) : INITIAL_CATALOG;
    
    const map = {};
    catalogSource.forEach(cat => {
      cat.subcategories.forEach(sub => {
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
        setAvailableAttributes(attrRes.data.map(attr => ({
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

        // Auto select first category
        if (mergedCatalog.length > 0) {
          setSelectedCatId(prev => {
            if (prev && mergedCatalog.some(c => c.id === prev)) return prev;
            return mergedCatalog[0].id;
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load category data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Sync to localStorage 'p2j_mart_catalog' for frontend compatibility
  useEffect(() => {
    if (catalog.length > 0) {
      localStorage.setItem('p2j_mart_catalog', JSON.stringify(catalog));
    }
  }, [catalog]);

  // Derive subcategories & products based on selection
  const activeCategory = catalog.find(c => c.id === selectedCatId) || catalog[0] || null;
  
  useEffect(() => {
    if (activeCategory && activeCategory.subcategories.length > 0) {
      setSelectedSubId(prev => {
        if (prev && activeCategory.subcategories.some(s => s.id === prev)) return prev;
        return activeCategory.subcategories[0].id;
      });
    } else {
      setSelectedSubId('');
    }
  }, [selectedCatId, activeCategory]);

  const activeSubcategory = activeCategory?.subcategories.find(s => s.id === selectedSubId) || activeCategory?.subcategories[0] || null;
  const activeProducts = activeSubcategory?.products || [];

  // Filtered products list
  const filteredProducts = activeProducts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total stats calculators
  const totalCategoriesCount = catalog.length;
  const totalSubcategoriesCount = catalog.reduce((acc, cat) => acc + (cat.subcategories || []).length, 0);
  const totalProductsCount = catalog.reduce((acc, cat) => 
    acc + (cat.subcategories || []).reduce((sAcc, sub) => sAcc + (sub.products || []).length, 0), 0
  );

  // ==========================================
  // ACTION HANDLERS (CRUD)
  // ==========================================

  // Category Actions
  const handleOpenCatModal = (editCat = null) => {
    if (editCat) {
      setCatForm({ 
        name: editCat.name, 
        image: editCat.image, 
        supportedAttributes: (editCat.supportedAttributes || []).map(attr => attr._id || attr.id || attr) 
      });
      setEditItem(editCat);
    } else {
      setCatForm({ name: '', image: '', supportedAttributes: [] });
      setEditItem(null);
    }
    setModalType('cat');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error('Category Name is required');

    const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
    const finalImageUrl = catForm.image ? catForm.image.trim() : defaultImage;

    const payload = {
      name: catForm.name.trim(),
      image: finalImageUrl,
      supportedAttributes: catForm.supportedAttributes || []
    };

    try {
      if (editItem) {
        const res = await updateCategoryAPI(editItem.id, payload);
        if (res.success) {
          toast.success('Category updated successfully');
          await loadCatalogData();
        } else {
          toast.error(res.message || 'Failed to update category');
        }
      } else {
        const res = await createCategoryAPI(payload);
        if (res.success) {
          toast.success('Category created successfully');
          await loadCatalogData();
        } else {
          toast.error(res.message || 'Failed to create category');
        }
      }
      setModalType(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDeleteCategory = (catId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Category',
      'Are you sure you want to delete this Category? All its subcategories and products will be permanently removed.',
      async () => {
        try {
          const res = await deleteCategoryAPI(catId);
          if (res.success) {
            toast.success('Category deleted successfully');
            await loadCatalogData();
            if (selectedCatId === catId) {
              setSelectedCatId('');
            }
          } else {
            toast.error(res.message || 'Failed to delete category');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error deleting category');
        }
      }
    );
  };

  // Subcategory Actions
  const handleOpenSubModal = (editSub = null, catId = null) => {
    setParentId(catId || selectedCatId);
    if (editSub) {
      setSubForm({ name: editSub.name, image: editSub.image || '' });
      setEditItem(editSub);
    } else {
      setSubForm({ name: '', image: '' });
      setEditItem(null);
    }
    setModalType('sub');
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) return toast.error('Subcategory Name is required');

    try {
      if (editItem) {
        const payload = {
          name: subForm.name.trim(),
          image: subForm.image
        };
        const res = await updateSubcategoryAPI(editItem.id, payload);
        if (res.success) {
          toast.success('Subcategory updated successfully');
          await loadCatalogData();
        } else {
          toast.error(res.message || 'Failed to update subcategory');
        }
      } else {
        const payload = {
          name: subForm.name.trim(),
          image: subForm.image,
          categoryId: parentId
        };
        const res = await createSubcategoryAPI(payload);
        if (res.success) {
          toast.success('Subcategory created successfully');
          await loadCatalogData();
          setSelectedSubId(res.data._id);
        } else {
          toast.error(res.message || 'Failed to create subcategory');
        }
      }
      setModalType(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving subcategory');
    }
  };

  const handleDeleteSubcategory = (subId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Subcategory',
      'Are you sure you want to delete this Subcategory and all its products?',
      async () => {
        try {
          const res = await deleteSubcategoryAPI(subId);
          if (res.success) {
            toast.success('Subcategory deleted successfully');
            await loadCatalogData();
            if (selectedSubId === subId) {
              setSelectedSubId('');
            }
          } else {
            toast.error(res.message || 'Failed to delete subcategory');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error deleting subcategory');
        }
      }
    );
  };

  // Product Actions
  const handleOpenProductModal = (editProd = null, subId = null) => {
    setParentId(subId || selectedSubId);
    if (editProd) {
      setProdForm({
        title: editProd.title,
        price: editProd.price,
        originalPrice: editProd.originalPrice || '',
        discount: editProd.discount || '0',
        image: editProd.image,
        rating: editProd.rating || '5',
        reviews: editProd.reviews || '0'
      });
      setEditItem(editProd);
    } else {
      setProdForm({
        title: '',
        price: '',
        originalPrice: '',
        discount: '0',
        image: '',
        rating: '5',
        reviews: '0'
      });
      setEditItem(null);
    }
    setModalType('prod');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.title.trim()) return toast.error('Product Title is required');
    if (!prodForm.price) return toast.error('Price is required');

    const defaultProdImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&h=500&q=80';
    const finalImageUrl = prodForm.image.trim() || defaultProdImage;
    const discountValue = parseInt(prodForm.discount) || 0;

    if (editItem) {
      const existingProduct = activeProducts.find(p => p.id === editItem.id || p._id === editItem.id) || {};
      const apiPayload = {
        ...existingProduct,
        title: prodForm.title,
        price: parseFloat(prodForm.price),
        originalPrice: prodForm.originalPrice ? parseFloat(prodForm.originalPrice) : null,
        discount: discountValue,
        image: finalImageUrl,
        rating: parseFloat(prodForm.rating),
        reviews: parseInt(prodForm.reviews),
        categoryId: selectedCatId,
        subcategoryId: parentId || selectedSubId
      };

      try {
        const res = await updateProductAPI(editItem.id || editItem._id, apiPayload);
        if (res && res.success) {
          toast.success('Product updated successfully');
          loadCatalogData();
          setModalType(null);
        } else {
          toast.error(res.message || 'Failed to update product');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error updating product');
      }
    } else {
      const apiPayload = {
        title: prodForm.title,
        price: parseFloat(prodForm.price),
        originalPrice: prodForm.originalPrice ? parseFloat(prodForm.originalPrice) : null,
        discount: discountValue,
        image: finalImageUrl,
        rating: parseFloat(prodForm.rating),
        reviews: parseInt(prodForm.reviews),
        categoryId: selectedCatId,
        subcategoryId: parentId || selectedSubId,
        variants: [],
        selectedAttributes: {}
      };

      try {
        const res = await createProductAPI(apiPayload);
        if (res && res.success) {
          toast.success('Product added successfully');
          loadCatalogData();
          setModalType(null);
        } else {
          toast.error(res.message || 'Failed to add product');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error adding product');
      }
    }
  };

  const handleDeleteProduct = (prodId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Product',
      'Are you sure you want to delete this Product?',
      async () => {
        try {
          const res = await deleteProductAPI(prodId);
          if (res && res.success) {
            toast.success('Product deleted successfully');
            loadCatalogData();
          } else {
            toast.error(res.message || 'Failed to delete product');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error deleting product');
        }
      }
    );
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Product Management"
        subtitle="Hierarchical tree view: Category ➔ Subcategory ➔ Products"
      >
        <AddBtn onClick={() => handleOpenCatModal()}>Add Category</AddBtn>
      </PageHeader>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <LayoutGrid size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Categories</span>
            <span className="text-xl font-bold text-gray-900">{totalCategoriesCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg shrink-0">
            <Folder size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Subcategories</span>
            <span className="text-xl font-bold text-gray-900">{totalSubcategoriesCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Products</span>
            <span className="text-xl font-bold text-gray-900">{totalProductsCount}</span>
          </div>
        </div>
      </div>

      {/* Tree Grid Manager Layout */}
      <div className="flex overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-12 gap-5 items-start pb-4 custom-scrollbar">
             {/* Step 1: Categories Panel (3 cols) */}
        {!isExpanded && (
          <div className="w-[280px] sm:w-[320px] lg:w-auto shrink-0 lg:col-span-3 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-left duration-200">
            <div className="bg-gray-50/75 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid size={13} className="text-[#001E3C]" /> 1. Categories
              </span>
              <button 
                onClick={() => handleOpenCatModal()}
                className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                title="Add New Category"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="p-2 flex flex-col gap-1 max-h-[500px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading categories...</div>
              ) : (
                catalog.map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                      selectedCatId === cat.id 
                        ? 'bg-[#001E3C] border border-[#001E3C] text-white font-semibold shadow-sm' 
                        : 'hover:bg-gray-50 border border-transparent text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-6 flex-1">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0" 
                      />
                      <span className="text-xs truncate w-full">{cat.name}</span>
                    </div>
                    <ChevronRight size={12} className={selectedCatId === cat.id ? "text-white/80 shrink-0 ml-auto" : "text-gray-400 shrink-0 ml-auto"} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-inherit pl-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                      <EditBtn size={11} onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }} title="Edit Category" />
                      <DeleteBtn size={11} onClick={(e) => handleDeleteCategory(cat.id, e)} title="Delete Category" />
                    </div>
                  </div>
                ))
              )}
              {!loading && catalog.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">No categories found. Click Add Category to begin.</div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Subcategories Panel (3 cols) */}
        {!isExpanded && (
          <div className="w-[280px] sm:w-[320px] lg:w-auto shrink-0 lg:col-span-3 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-left duration-200">
            <div className="bg-gray-50/75 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Folder size={13} className="text-amber-500" /> 2. Subcategories
              </span>
              <button 
                onClick={() => handleOpenSubModal()}
                disabled={!selectedCatId || loading}
                className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Add Subcategory to Selected Category"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="p-2 flex flex-col gap-1 max-h-[500px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading subcategories...</div>
              ) : (
                activeCategory?.subcategories.map(sub => (
                  <div 
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                      selectedSubId === sub.id 
                        ? 'bg-[#001E3C] border border-[#001E3C] text-white font-semibold shadow-sm' 
                        : 'hover:bg-gray-50 border border-transparent text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-6 flex-1">
                      <div className="w-7 h-7 rounded overflow-hidden border shrink-0 bg-white flex items-center justify-center">
                        {sub.image ? (
                          <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            selectedSubId === sub.id ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <Folder size={13} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs truncate w-full">{sub.name}</span>
                    </div>
                    <ChevronRight size={12} className={selectedSubId === sub.id ? "text-white/80 shrink-0 ml-auto" : "text-gray-400 shrink-0 ml-auto"} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-inherit pl-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                      <EditBtn size={11} onClick={(e) => { e.stopPropagation(); handleOpenSubModal(sub); }} title="Edit Subcategory" />
                      <DeleteBtn size={11} onClick={(e) => handleDeleteSubcategory(sub.id, e)} title="Delete Subcategory" />
                    </div>
                  </div>
                ))
              )}
              {!loading && (!activeCategory || activeCategory.subcategories.length === 0) && (
                <div className="text-center py-8 text-xs text-gray-400">
                  {!selectedCatId ? "Select a Category first" : "No subcategories found. Click '+' to add."}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Step 3: Products Panel (6 cols or 12 cols depending on isExpanded) */}
        <div className={`${isExpanded ? 'w-full lg:col-span-12' : 'w-[320px] sm:w-[480px] lg:w-auto shrink-0 lg:col-span-6'} bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm min-h-[400px] transition-all duration-300`}>
          <div className="bg-gray-50/75 border-b border-gray-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={13} className="text-emerald-500" /> 3. Products ({filteredProducts.length})
            </span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1 border border-gray-300 rounded-md text-[11px] outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40 bg-white"
                />
                <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <AddBtn
                onClick={() => navigate(`/admin/products/add?catId=${selectedCatId}&subId=${selectedSubId}`)}
                disabled={!selectedSubId}
              >
                Add Product
              </AddBtn>
              
              <button 
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1.5 hover:bg-gray-200 border border-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                title={isExpanded ? "Exit Full Screen" : "Open Full Page"}
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Products List Grid / Table */}
          {isExpanded ? (
            <AdminTable
              headers={[
                { label: 'Product' },
                { label: 'Category' },
                { label: 'Variants' },
                { label: 'Total Qty', align: 'center' },
                { label: 'Availability', align: 'center' },
                { label: 'Status', align: 'center' },
                { label: 'Reviews', align: 'center' },
                { label: 'Actions', align: 'center' }
              ]}
              data={filteredProducts}
              maxHeight="500px"
              containerClassName="border-0 shadow-none rounded-none"
              emptyMessage={
                <div className="flex flex-col items-center gap-2 justify-center">
                  <Package size={24} className="text-gray-300" />
                  <span>
                    {!selectedSubId ? "Select a Subcategory first" : "No products found in this subcategory."}
                  </span>
                </div>
              }
              renderRow={(prod) => {
                const subcategoryName = activeSubcategory?.name || "Standard";
                return (
                  <tr key={prod.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Product */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                          {getProductDisplayImage(prod) ? (
                            <img src={getProductDisplayImage(prod)} alt={prod.title} className="w-full h-full object-cover" />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">{prod.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{subcategoryName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {activeCategory?.name || "Category"}
                      </span>
                    </td>

                    {/* Variants */}
                    <td className="py-4 px-4">
                      {prod.variants && prod.variants.length > 0 ? (
                        <div className="flex flex-col gap-2 min-w-[140px] max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                          {prod.variants.map((v, index) => {
                            const colorVal = v.attributes?.color || '';
                            const sizeVal = v.attributes?.size || '';
                            
                            const hasPipe = colorVal.includes('|');
                            const colorName = hasPipe ? colorVal.split('|')[0] : colorVal;
                            const colorHex = hasPipe ? colorVal.split('|')[1] : null;
                            
                            const labelParts = [];
                            if (colorName) labelParts.push(colorName);
                            if (sizeVal) labelParts.push(sizeVal);
                            const label = labelParts.join(' / ') || 'Standard Variant';

                            return (
                              <div 
                                key={v.id || v._id || index}
                                className="flex flex-col border border-gray-205 rounded-2xl p-3 bg-white shadow-xs leading-normal font-sans"
                              >
                                <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[10px]">
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-gray-200 block shrink-0"
                                    style={{ backgroundColor: colorHex || '#E5E7EB' }}
                                  />
                                  <span>{label}</span>
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold mt-1.5">
                                  Price: <span className="text-purple-600 font-extrabold">₹{Number(v.price).toLocaleString()}</span>
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold mt-0.5">
                                  Inv: <span className="text-pink-600 font-extrabold">{v.stock} units</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : prod.selectedAttributes && Object.keys(prod.selectedAttributes).length > 0 ? (
                        <div className="inline-flex flex-col border border-gray-200 rounded-xl p-2 bg-white min-w-[130px] shadow-sm leading-normal gap-1">
                          {Object.entries(prod.selectedAttributes).map(([attrName, values]) => (
                            <div key={attrName} className="text-[9px] text-gray-500 font-medium">
                              <span className="capitalize font-bold text-gray-750">{attrName}:</span> {values.join(', ')}
                            </div>
                          ))}
                          <div className="text-[9px] font-bold text-purple-600 border-t border-slate-100 pt-0.5 mt-0.5">Price: ₹{prod.price}</div>
                        </div>
                      ) : (
                        <div className="flex flex-col border border-gray-250 rounded-2xl p-3 bg-white min-w-[140px] shadow-xs leading-normal font-sans">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[10px]">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-200 bg-gray-200 block shrink-0" />
                            <span>Standard</span>
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold mt-1.5">
                            Price: <span className="text-purple-600 font-extrabold">₹{Number(prod.price).toLocaleString()}</span>
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold mt-0.5">
                            Inv: <span className="text-pink-600 font-extrabold">{prod.stock !== undefined ? prod.stock : 10} units</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Total Qty */}
                    <td className="py-4 px-4 text-center font-bold text-gray-800 text-xs">
                      {(() => {
                        const totalQty = prod.variants && prod.variants.length > 0
                          ? prod.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                          : (prod.stock !== undefined ? parseInt(prod.stock) : 10);
                        return totalQty;
                      })()}
                    </td>

                    {/* Availability */}
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const totalQty = prod.variants && prod.variants.length > 0
                          ? prod.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                          : (prod.stock !== undefined ? parseInt(prod.stock) : 10);
                        const isOutOfStock = totalQty === 0;
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                            isOutOfStock 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          }`}>
                            {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const statusVal = prod.status || 'Active';
                        const isActive = statusVal.toLowerCase() === 'active';
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {statusVal}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Reviews */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1">
                          <Star size={10} className="text-gray-300 fill-none" />
                          <span className="font-bold text-gray-800 text-[10px]">{prod.rating ? prod.rating.toFixed(1) : "0.0"}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{prod.reviews || 0} reviews</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <ViewBtn
                          size={14}
                          onClick={() => handleViewProduct(prod)}
                          title="View Product"
                        />
                        <EditBtn
                          size={14}
                          onClick={() => navigate(`/admin/products/add?edit=true&catId=${selectedCatId}&subId=${selectedSubId}&prodId=${prod.id}`)}
                          title="Edit Product"
                        />
                        <DeleteBtn
                          size={14}
                          onClick={(e) => handleDeleteProduct(prod.id, e)}
                          title="Delete Product"
                        />
                      </div>
                    </td>
                  </tr>
                );
              }}
            />
          ) : (
            /* Products List Grid */
            <div className="p-4 grid gap-3 max-h-[500px] overflow-y-auto custom-scrollbar grid-cols-1 md:grid-cols-2">
              {filteredProducts.map(prod => (
                <div 
                  key={prod.id} 
                  className="border border-gray-100 hover:border-gray-200 rounded-lg p-3 bg-gray-50/30 flex gap-3 relative group transition-all hover:shadow-sm"
                >
                  <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 shrink-0 bg-white aspect-square">
                    <img src={getProductDisplayImage(prod)} alt={prod.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow min-w-0 pr-6">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight tracking-wide">{prod.title}</h4>
                    
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-xs font-bold text-gray-950">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">₹{prod.originalPrice}</span>
                      )}
                      {prod.discount > 0 && (
                        <span className="text-[9px] text-emerald-600 font-bold">{prod.discount}% Off</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} fill="currentColor" className="text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-600">{prod.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-400">({prod.reviews})</span>
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditBtn size={11} onClick={() => navigate(`/admin/products/add?edit=true&catId=${selectedCatId}&subId=${selectedSubId}&prodId=${prod.id}`)} title="Edit Product" />
                    <DeleteBtn size={11} onClick={(e) => handleDeleteProduct(prod.id, e)} title="Delete Product" />
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 text-xs text-gray-400 flex flex-col items-center gap-2 justify-center">
                  <Package size={24} className="text-gray-300" />
                  <span>
                    {!selectedSubId ? "Select a Subcategory first" : "No products found in this subcategory."}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          DYNAMIC MODAL ENTRY DIALOGS
         ========================================== */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-[#001E3C] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">
                {editItem ? 'Edit' : 'Add New'} {
                  modalType === 'cat' ? 'Category' : 
                  modalType === 'sub' ? 'Subcategory' : 'Product'
                }
              </span>
              <button 
                onClick={() => setModalType(null)}
                className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Forms */}
            <form onSubmit={
              modalType === 'cat' ? handleSaveCategory :
              modalType === 'sub' ? handleSaveSubcategory : undefined
            } className="p-5 flex flex-col gap-4">
              
              {/* CATEGORY FORM */}
              {modalType === 'cat' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={11} /> Category Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gift Items"
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Image size={11} /> Upload Category Image
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressAndConvertToWebP(file);
                            setCatForm({ ...catForm, image: compressed });
                          } catch (err) {
                            toast.error(err.message || 'Failed to process image');
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                    />
                    {catForm.image && (
                      <div className="mt-1.5 w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img src={catForm.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Supported Variants/Attributes
                    </label>
                    <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                      {availableAttributes.map(attr => {
                        const isChecked = catForm.supportedAttributes.includes(attr.id);
                        return (
                          <label key={attr.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked 
                                  ? [...catForm.supportedAttributes, attr.id]
                                  : catForm.supportedAttributes.filter(id => id !== attr.id);
                                setCatForm({ ...catForm, supportedAttributes: updated });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="capitalize">{attr.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Select which variations can be configured when adding products to this category.
                    </span>
                  </div>
                </>
              )}

              {/* SUBCATEGORY FORM */}
              {modalType === 'sub' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={11} /> Subcategory Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Personalized Gifts"
                      value={subForm.name}
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Image size={11} /> Upload Subcategory Image
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressAndConvertToWebP(file);
                            setSubForm({ ...subForm, image: compressed });
                          } catch (err) {
                            toast.error(err.message || 'Failed to process image');
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                    />
                    {subForm.image && (
                      <div className="mt-1.5 w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img src={subForm.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* PRODUCT FORM */}
              {modalType === 'prod' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Package size={11} /> Product Title
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Custom Spotify Frame Plaque"
                      value={prodForm.title}
                      onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign size={11} /> Price (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="500"
                        value={prodForm.price}
                        onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign size={11} /> Original Price (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="550 (optional)"
                        value={prodForm.originalPrice}
                        onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Percent size={11} /> Discount (%)
                      </label>
                      <input 
                        type="number" 
                        placeholder="10"
                        value={prodForm.discount}
                        onChange={(e) => setProdForm({ ...prodForm, discount: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Star size={11} /> Rating
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="4.8"
                        value={prodForm.rating}
                        onChange={(e) => setProdForm({ ...prodForm, rating: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        Reviews
                      </label>
                      <input 
                        type="number" 
                        placeholder="24"
                        value={prodForm.reviews}
                        onChange={(e) => setProdForm({ ...prodForm, reviews: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Image size={11} /> Upload Product Image
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressAndConvertToWebP(file);
                            setProdForm({ ...prodForm, image: compressed });
                          } catch (err) {
                            toast.error(err.message || 'Failed to process image');
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                <CancelBtn onClick={() => setModalType(null)} />
                <SaveBtn type="submit">Save Changes</SaveBtn>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Dynamic Product Detail Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xl font-bold text-black">{previewProduct.title}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Curated Item Details Overview</p>
              </div>
              <button 
                onClick={() => setPreviewProduct(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                {/* Big Image Card */}
                {(() => {
                  const selectedVar = previewProduct.variants?.[selectedVariantIndex];
                  let imagesList = [];
                  if (selectedVar) {
                    imagesList = Array.from(new Set([
                      selectedVar.image,
                      ...(selectedVar.images || [])
                    ].filter(Boolean)));
                  }
                  
                  if (imagesList.length === 0 && previewProduct.image) {
                    imagesList = [previewProduct.image];
                  }
                  
                  const activeImg = imagesList[activeImageIndex] || 'https://via.placeholder.com/500';

                  return (
                    <>
                      <div className="relative aspect-square w-full rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center group">
                        <img 
                          src={activeImg} 
                          alt={previewProduct.title} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {/* 1/3 Indicator */}
                        {imagesList.length > 0 && (
                          <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">
                            {activeImageIndex + 1} / {imagesList.length}
                          </span>
                        )}
                        {/* Eye icon on bottom right */}
                        <div className="absolute bottom-3 right-3 bg-white/95 text-slate-700 p-1.5 rounded-full shadow-md">
                          <Eye size={14} className="text-slate-800 font-bold" />
                        </div>
                      </div>

                      {/* Thumbnails Carousel */}
                      {imagesList.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {imagesList.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 shrink-0 transition-all ${
                                idx === activeImageIndex 
                                  ? 'border-purple-600 shadow-sm scale-95' 
                                  : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Attributes Card */}
                {previewProduct.selectedAttributes && Object.keys(previewProduct.selectedAttributes).length > 0 && (
                  <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Attributes</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(previewProduct.selectedAttributes).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-black shadow-xs capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>{key}: {Array.isArray(val) ? val.join(', ') : val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom stats row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Variants Stat */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between h-20 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Variants</span>
                    <span className="text-xl font-bold text-black mt-1">
                      {previewProduct.variants?.length || 0}
                    </span>
                  </div>

                  {/* Status Stat */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between h-20 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        (previewProduct.status || 'Active').toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-xs font-bold text-black capitalize">
                        {previewProduct.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div>
                  {/* Collection/Category Tag */}
                  <span className="inline-flex items-center bg-[#001E3C] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    {activeCategory?.name || "Premium Vases"}
                  </span>
                  <h4 className="text-2xl font-black text-black leading-tight">{previewProduct.title}</h4>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">
                      <Star size={12} className="fill-amber-500 stroke-amber-500" />
                      <span>{previewProduct.rating || "4.9"}</span>
                    </div>
                    <span className="text-slate-400 font-semibold">/ {previewProduct.reviews || 128} Reviews</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-semibold">Brand: <strong className="text-slate-800">FloraFlow Artisans</strong></span>
                  </div>
                </div>

                {/* Curation Options / Variants List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-black">Curation Options</span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">Click to Select</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {previewProduct.variants && previewProduct.variants.length > 0 ? (
                      previewProduct.variants.map((v, idx) => {
                        const isSelected = idx === selectedVariantIndex;
                        const label = Object.values(v.attributes).join(' / ');
                        return (
                          <button
                            key={v.id || idx}
                            type="button"
                            onClick={() => {
                              setSelectedVariantIndex(idx);
                              setActiveImageIndex(0);
                            }}
                            className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative ${
                              isSelected 
                                ? 'border-purple-600 bg-purple-50/20 shadow-[0_0_12px_rgba(147,51,234,0.06)]' 
                                : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase mb-1">N/A</span>
                            <span className="text-xs font-bold text-black block truncate pr-8">{label}</span>
                            
                            <div className="flex items-baseline gap-1.5 mt-2">
                              {v.originalPrice && v.originalPrice > v.price && (
                                <span className="text-[10px] text-slate-400 line-through">₹{v.originalPrice}</span>
                              )}
                              <span className="text-base font-extrabold text-purple-700">₹{v.price}</span>
                            </div>

                            <span className="absolute bottom-3 right-3 bg-white border border-slate-150 text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md">
                              QTY: {v.stock}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      /* Fallback default variant card if no variants exist */
                      <div className="flex flex-col text-left p-3.5 rounded-2xl border border-purple-600 bg-purple-50/20 shadow-[0_0_12px_rgba(147,51,234,0.06)] relative">
                        <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase mb-1">N/A</span>
                        <span className="text-xs font-bold text-black block truncate pr-8">Standard Color / Size</span>
                        
                        <div className="flex items-baseline gap-1.5 mt-2">
                          {previewProduct.originalPrice && previewProduct.originalPrice > previewProduct.price && (
                            <span className="text-[10px] text-slate-400 line-through">₹{previewProduct.originalPrice}</span>
                          )}
                          <span className="text-base font-extrabold text-purple-700">₹{previewProduct.price}</span>
                        </div>

                        <span className="absolute bottom-3 right-3 bg-white border border-slate-150 text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md">
                          QTY: 10
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description block */}
                <div className="mt-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Descriptions</span>
                  <blockquote className="mt-2 border-l-2 border-slate-200 pl-3.5 text-xs text-slate-600 italic font-semibold leading-relaxed">
                    "{previewProduct.description || "High-quality item designed for long-lasting home and event decor. Hand-crafted with premium materials."}"
                  </blockquote>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-150 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
              <CancelBtn onClick={() => setPreviewProduct(null)}>Dismiss</CancelBtn>
              <PrimaryBtn 
                onClick={() => {
                  setPreviewProduct(null);
                  navigate(`/admin/products/add?edit=true&catId=${selectedCatId}&subId=${selectedSubId}&prodId=${previewProduct.id}`);
                }}
                icon={Edit3}
              >
                Edit Product
              </PrimaryBtn>
            </div>

          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default Products;
