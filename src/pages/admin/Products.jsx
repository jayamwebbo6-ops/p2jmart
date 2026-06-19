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
  Star 
} from 'lucide-react';
import { toast } from '../../components/toast';
import ConfirmationModal from '../../components/ConfirmationModal';

// Initial pre-populated catalog tree data matching user theme
const INITIAL_CATALOG = [
  {
    id: 'cat-1',
    name: 'Gift Items',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&h=150&q=80',
    subcategories: [
      {
        id: 'sub-1-1',
        name: 'Personalized Gifts',
        products: [
          {
            id: 'prod-1-1-1',
            title: 'SNAP ART Customized Spotify Plaque',
            price: 500,
            originalPrice: 550,
            discount: 9,
            rating: 4.8,
            reviews: 42,
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&h=500&q=80'
          },
          {
            id: 'prod-1-1-2',
            title: 'Personalized Square Floral Wood Frame',
            price: 300,
            originalPrice: 500,
            discount: 40,
            rating: 4.6,
            reviews: 18,
            image: 'https://images.unsplash.com/photo-1579783928621-7a13d66a6211?auto=format&fit=crop&w=500&h=500&q=80'
          }
        ]
      },
      {
        id: 'sub-1-2',
        name: 'Birthday Plaques',
        products: [
          {
            id: 'prod-1-2-1',
            title: 'Acrylic Wall Hanging Frame',
            price: 1200,
            originalPrice: 1500,
            discount: 20,
            rating: 4.9,
            reviews: 55,
            image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=500&h=500&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=150&h=150&q=80',
    subcategories: [
      {
        id: 'sub-2-1',
        name: 'Headphones & Speakers',
        products: [
          {
            id: 'prod-2-1-1',
            title: 'Premium Wireless Headphones',
            price: 199.00,
            originalPrice: 249.00,
            discount: 20,
            rating: 4.5,
            reviews: 28,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&h=500&q=80'
          },
          {
            id: 'prod-2-1-2',
            title: 'Smart Watch Series 9',
            price: 299.00,
            originalPrice: 349.00,
            discount: 14,
            rating: 4.8,
            reviews: 42,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&h=500&q=80'
          }
        ]
      }
    ]
  }
];

const Products = () => {
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('p2j_mart_catalog');
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  // Active selections
  const [selectedCatId, setSelectedCatId] = useState(catalog[0]?.id || '');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [catForm, setCatForm] = useState({ name: '', image: '' });
  const [subForm, setSubForm] = useState({ name: '' });
  const [prodForm, setProdForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '0',
    image: '',
    rating: '5',
    reviews: '0'
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('p2j_mart_catalog', JSON.stringify(catalog));
  }, [catalog]);

  // Derive subcategories & products based on selection
  const activeCategory = catalog.find(c => c.id === selectedCatId) || catalog[0] || null;
  
  useEffect(() => {
    if (activeCategory && activeCategory.subcategories.length > 0) {
      setSelectedSubId(activeCategory.subcategories[0].id);
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
  const totalSubcategoriesCount = catalog.reduce((acc, cat) => acc + cat.subcategories.length, 0);
  const totalProductsCount = catalog.reduce((acc, cat) => 
    acc + cat.subcategories.reduce((sAcc, sub) => sAcc + sub.products.length, 0), 0
  );

  // ==========================================
  // ACTION HANDLERS (CRUD)
  // ==========================================

  // Category Actions
  const handleOpenCatModal = (editCat = null) => {
    if (editCat) {
      setCatForm({ name: editCat.name, image: editCat.image });
      setEditItem(editCat);
    } else {
      setCatForm({ name: '', image: '' });
      setEditItem(null);
    }
    setModalType('cat');
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error('Category Name is required');

    const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&h=150&q=80';
    const finalImageUrl = catForm.image.trim() || defaultImage;

    if (editItem) {
      setCatalog(prev => prev.map(c => 
        c.id === editItem.id ? { ...c, name: catForm.name, image: finalImageUrl } : c
      ));
      toast.success('Category updated successfully');
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: catForm.name,
        image: finalImageUrl,
        subcategories: []
      };
      setCatalog(prev => [...prev, newCat]);
      setSelectedCatId(newCat.id);
      toast.success('Category created successfully');
    }
    setModalType(null);
  };

  const handleDeleteCategory = (catId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Category',
      'Are you sure you want to delete this Category? All its subcategories and products will be permanently removed.',
      () => {
        setCatalog(prev => prev.filter(c => c.id !== catId));
        if (selectedCatId === catId) {
          const remaining = catalog.filter(c => c.id !== catId);
          setSelectedCatId(remaining[0]?.id || '');
        }
        toast.success('Category deleted successfully');
      }
    );
  };

  // Subcategory Actions
  const handleOpenSubModal = (editSub = null, catId = null) => {
    setParentId(catId || selectedCatId);
    if (editSub) {
      setSubForm({ name: editSub.name });
      setEditItem(editSub);
    } else {
      setSubForm({ name: '' });
      setEditItem(null);
    }
    setModalType('sub');
  };

  const handleSaveSubcategory = (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) return toast.error('Subcategory Name is required');

    if (editItem) {
      setCatalog(prev => prev.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => 
          s.id === editItem.id ? { ...s, name: subForm.name } : s
        )
      })));
      toast.success('Subcategory updated successfully');
    } else {
      const newSub = {
        id: `sub-${Date.now()}`,
        name: subForm.name,
        products: []
      };
      setCatalog(prev => prev.map(c => 
        c.id === parentId ? { ...c, subcategories: [...c.subcategories, newSub] } : c
      ));
      setSelectedSubId(newSub.id);
      toast.success('Subcategory created successfully');
    }
    setModalType(null);
  };

  const handleDeleteSubcategory = (subId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Subcategory',
      'Are you sure you want to delete this Subcategory and all its products?',
      () => {
        setCatalog(prev => prev.map(c => ({
          ...c,
          subcategories: c.subcategories.filter(s => s.id !== subId)
        })));
        if (selectedSubId === subId) {
          setSelectedSubId('');
        }
        toast.success('Subcategory deleted successfully');
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

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title.trim()) return toast.error('Product Title is required');
    if (!prodForm.price) return toast.error('Price is required');

    const defaultProdImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&h=500&q=80';
    const finalImageUrl = prodForm.image.trim() || defaultProdImage;

    const discountValue = parseInt(prodForm.discount) || 0;

    if (editItem) {
      setCatalog(prev => prev.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => ({
          ...s,
          products: s.products.map(p => 
            p.id === editItem.id ? {
              ...p,
              title: prodForm.title,
              price: parseFloat(prodForm.price),
              originalPrice: prodForm.originalPrice ? parseFloat(prodForm.originalPrice) : null,
              discount: discountValue,
              image: finalImageUrl,
              rating: parseFloat(prodForm.rating),
              reviews: parseInt(prodForm.reviews)
            } : p
          )
        }))
      })));
      toast.success('Product updated successfully');
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        title: prodForm.title,
        price: parseFloat(prodForm.price),
        originalPrice: prodForm.originalPrice ? parseFloat(prodForm.originalPrice) : null,
        discount: discountValue,
        image: finalImageUrl,
        rating: parseFloat(prodForm.rating),
        reviews: parseInt(prodForm.reviews)
      };

      setCatalog(prev => prev.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => 
          s.id === parentId ? { ...s, products: [...s.products, newProd] } : s
        )
      })));
      toast.success('Product added successfully');
    }
    setModalType(null);
  };

  const handleDeleteProduct = (prodId, e) => {
    e.stopPropagation();
    triggerConfirm(
      'Delete Product',
      'Are you sure you want to delete this Product?',
      () => {
        setCatalog(prev => prev.map(c => ({
          ...c,
          subcategories: c.subcategories.map(s => ({
            ...s,
            products: s.products.filter(p => p.id !== prodId)
          }))
        })));
        toast.success('Product deleted successfully');
      }
    );
  };

  return (
    <div className="w-full text-slate-800 antialiased min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#001E3C]">Product Management </h1>
          <p className="text-xs text-gray-500 mt-1">Hierarchical tree view: Category ➔ Subcategory ➔ Products</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => handleOpenCatModal()}
            className="flex items-center gap-1.5 bg-[#001E3C] hover:bg-[#003147] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Step 1: Categories Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
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
            {catalog.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedCatId === cat.id 
                    ? 'bg-blue-50/50 border border-blue-100 text-blue-900 font-semibold' 
                    : 'hover:bg-gray-50 border border-transparent text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0" 
                  />
                  <span className="text-xs truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={11} />
                  </button>
                  <ChevronRight size={12} className="text-gray-400 ml-0.5" />
                </div>
              </div>
            ))}
            {catalog.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">No categories found. Click Add Category to begin.</div>
            )}
          </div>
        </div>

        {/* Step 2: Subcategories Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/75 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Folder size={13} className="text-amber-500" /> 2. Subcategories
            </span>
            <button 
              onClick={() => handleOpenSubModal()}
              disabled={!selectedCatId}
              className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Add Subcategory to Selected Category"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="p-2 flex flex-col gap-1 max-h-[500px] overflow-y-auto custom-scrollbar">
            {activeCategory?.subcategories.map(sub => (
              <div 
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedSubId === sub.id 
                    ? 'bg-amber-50/50 border border-amber-100 text-amber-900 font-semibold' 
                    : 'hover:bg-gray-50 border border-transparent text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                    <Folder size={13} />
                  </div>
                  <span className="text-xs truncate">{sub.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenSubModal(sub); }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteSubcategory(sub.id, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={11} />
                  </button>
                  <ChevronRight size={12} className="text-gray-400 ml-0.5" />
                </div>
              </div>
            ))}
            {(!activeCategory || activeCategory.subcategories.length === 0) && (
              <div className="text-center py-8 text-xs text-gray-400">
                {!selectedCatId ? "Select a Category first" : "No subcategories found. Click '+' to add."}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Products Panel (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
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
              <button 
                onClick={() => handleOpenProductModal()}
                disabled={!selectedSubId}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors disabled:cursor-not-allowed"
              >
                <Plus size={11} /> Add Product
              </button>
            </div>
          </div>

          {/* Products List Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className="border border-gray-100 hover:border-gray-200 rounded-lg p-3 bg-gray-50/30 flex gap-3 relative group transition-all hover:shadow-sm"
              >
                <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 shrink-0 bg-white aspect-square">
                  <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
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
                  <button 
                    onClick={() => handleOpenProductModal(prod)}
                    className="p-1.5 bg-white hover:bg-blue-50 border border-gray-200 rounded text-gray-600 hover:text-blue-600 shadow-sm"
                    title="Edit Product"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProduct(prod.id, e)}
                    className="p-1.5 bg-white hover:bg-red-50 border border-gray-200 rounded text-gray-600 hover:text-red-600 shadow-sm"
                    title="Delete Product"
                  >
                    <Trash2 size={11} />
                  </button>
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
              modalType === 'sub' ? handleSaveSubcategory : handleSaveProduct
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
                      <Image size={11} /> Image Link
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/... (optional)"
                      value={catForm.image}
                      onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </>
              )}

              {/* SUBCATEGORY FORM */}
              {modalType === 'sub' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={11} /> Subcategory Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Personalized Gifts"
                    value={subForm.name}
                    onChange={(e) => setSubForm({ name: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    required
                  />
                </div>
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
                      <Image size={11} /> Image Link
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/... (optional)"
                      value={prodForm.image}
                      onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#001E3C] hover:bg-[#003147] text-white rounded-md text-xs font-bold transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>

            </form>
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
