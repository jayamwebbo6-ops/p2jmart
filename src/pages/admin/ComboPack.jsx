import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { Search, X } from 'lucide-react';
import AdminTable from '../../components/AdminTable';
import { 
  EditBtn, 
  DeleteBtn, 
  ViewBtn, 
  AddBtn, 
  SaveBtn 
} from '../../components/AdminButtons';
import { toast, ToastContainer } from '../../components/toast'; 
import PageHeader from '../../components/PageHeader';
import ProductReviews from './ProductReviews'; 
import { getProductsAPI } from '../../api/productApi';
import { getCategoriesAPI } from '../../api/categoryApi';
import { 
  getCombosAPI, 
  createComboAPI, 
  updateComboAPI, 
  deleteComboAPI, 
  toggleComboStatusAPI 
} from '../../api/comboApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const formatImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  const cleanSrc = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanSrc}`;
};

const getProductStock = (p) => {
  if (!p) return 0;
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  return p.stock || 0;
};

const ComboPacks = () => {
  const [combos, setCombos] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProductSearch, setModalProductSearch] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [sortConfig, setSortConfig] = useState({ key: 'sNo', direction: 'asc' });

  // State hook to selectively toggle sub-view layer
  const [selectedComboForReviews, setSelectedComboForReviews] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    totalPrice: '',
    offerPrice: '',
    description: '',
    selectedItemIds: []
  });

  const tableHeaders = [
    { key: 'sNo', label: 'S.No', sortable: true, align: 'left' },
    { key: 'preview', label: 'Preview', sortable: false, align: 'left' },
    { key: 'name', label: 'Name', sortable: true, align: 'left' },
    { key: 'offerPrice', label: 'Pricing', sortable: true, align: 'left' },
    { key: 'stocks', label: 'Stock Status', sortable: false, align: 'left' },
    { key: 'status', label: 'Status', sortable: true, align: 'left' },
    { key: 'rating', label: 'Rating', sortable: true, align: 'left' },
    { key: 'actions', label: 'Actions', sortable: false, align: 'center' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch combos from db
      const combosRes = await getCombosAPI();
      if (combosRes && combosRes.success) {
        setCombos(combosRes.data || []);
      }

      // 2. Fetch all products (including inactive ones for configuration)
      const productsRes = await getProductsAPI({ includeInactive: 'true' });
      if (productsRes && productsRes.success) {
        setAvailableProducts(productsRes.data || []);
      }

      // 3. Fetch categories for grouping
      const categoriesRes = await getCategoriesAPI();
      if (categoriesRes && categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (err) {
      console.error("Error loading combo pack dependencies:", err);
      toast.error("Failed to load store data from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRatingClick = (e, combo) => {
    e.stopPropagation(); 
    setSelectedComboForReviews(combo); // Intercept and sets local layout active context
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleStatus = async (id) => {
    try {
      const res = await toggleComboStatusAPI(id);
      if (res && res.success) {
        toast.success(res.message || "Combo activation status modified.");
        loadData();
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this combo pack record?")) {
      const performDelete = async () => {
        try {
          const res = await deleteComboAPI(id);
          if (res && res.success) {
            toast.success("Combo pack deleted successfully.");
            loadData();
          } else {
            toast.error(res.message || "Failed to delete combo pack.");
          }
        } catch (err) {
          console.error("Error deleting combo:", err);
          toast.error("Failed to delete combo pack.");
        }
      };
      performDelete();
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setModalProductSearch('');
    setFormData({
      name: '',
      category: categories[0]?.name || '',
      subcategory: categories[0]?.subcategories?.[0]?.name || '',
      totalPrice: '',
      offerPrice: '',
      description: '',
      selectedItemIds: []
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (combo) => {
    setIsEditMode(true);
    setCurrentCombo(combo);
    setModalProductSearch('');
    setFormData({
      name: combo.name,
      category: combo.category || '',
      subcategory: combo.subcategory || '',
      totalPrice: combo.totalPrice,
      offerPrice: combo.offerPrice,
      description: combo.description || '',
      selectedItemIds: (combo.selectedItemIds || []).map(p => p._id || p.id || p)
    });
    setIsFormModalOpen(true);
  };

  const openViewModal = (combo) => {
    setCurrentCombo(combo);
    setIsViewModalOpen(true);
  };

  const handleProductSelectionToggle = (productId) => {
    setFormData(prev => {
      const alreadySelected = prev.selectedItemIds.includes(productId);
      const updatedIds = alreadySelected 
        ? prev.selectedItemIds.filter(id => id !== productId)
        : [...prev.selectedItemIds, productId];

      const currentSelectedProducts = availableProducts.filter(p => updatedIds.includes(p._id || p.id));
      const collectiveSum = currentSelectedProducts.reduce((acc, current) => {
        const price = current.variants?.[0]?.price || current.price || 0;
        return acc + price;
      }, 0);

      return {
        ...prev,
        selectedItemIds: updatedIds,
        totalPrice: collectiveSum > 0 ? collectiveSum : ''
      };
    });
  };

  const handleFormSave = async (e) => {
    e.preventDefault();
    const cleanOfferPrice = Math.max(0, Number(formData.offerPrice) || 0);

    if (!formData.name || formData.selectedItemIds.length === 0) {
      toast.warning("Please provide a valid combo name and select at least one item.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        totalPrice: Number(formData.totalPrice) || 0,
        offerPrice: cleanOfferPrice,
        description: formData.description,
        selectedItemIds: formData.selectedItemIds
      };

      if (isEditMode && currentCombo) {
        const res = await updateComboAPI(currentCombo._id || currentCombo.id, payload);
        if (res && res.success) {
          toast.success("Combo pack updated successfully.");
          loadData();
        } else {
          toast.error(res.message || "Failed to update combo pack.");
        }
      } else {
        const res = await createComboAPI(payload);
        if (res && res.success) {
          toast.success("Combo pack added successfully.");
          loadData();
        } else {
          toast.error(res.message || "Failed to create combo pack.");
        }
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Error saving combo pack:", err);
      toast.error(err.response?.data?.message || "Failed to save combo pack.");
    }
  };

  const filteredCombos = combos.filter(c => 
    c.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const sortedCombos = [...filteredCombos].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === 'sNo') {
      // sNo is derived from index, so handle comparison on indices or ids
      return 0; 
    }
    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const renderComboRow = (combo, index) => {
    const sNo = index + 1;
    const internalProducts = combo.selectedItemIds || [];
    const previewImage = internalProducts[0]?.image ? formatImageUrl(internalProducts[0].image) : '';
    
    return (
      <tr key={combo._id || combo.id} className="hover:bg-slate-50/50 transition-colors font-medium">
        <td className="py-4 px-4 text-primary">{sNo}</td>
        <td className="py-4 px-4">
          {previewImage ? (
            <img src={previewImage} alt={combo.name} className="w-12 h-12 object-cover rounded-md border border-gray-100" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 text-primary rounded-md flex items-center justify-center text-[10px]">N/A</div>
          )}
        </td>
        <td className="py-4 px-4 font-bold text-primary text-sm">{combo.name}</td>
        <td className="py-4 px-4">
          <div className="text-primary font-bold">₹{combo.offerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="text-primary opacity-50 text-[11px] line-through">₹{combo.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1 flex-wrap">
            {internalProducts.map((p) => {
              const stockVal = getProductStock(p);
              return (
                <span key={p._id || p.id} className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${stockVal === 0 ? 'bg-red-50 text-red-500 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`} title={p.title || p.name}>
                  {stockVal}
                </span>
              );
            })}
          </div>
        </td>
        <td className="py-4 px-4">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" checked={combo.status} onChange={() => toggleStatus(combo._id || combo.id)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </td>
        <td className="py-4 px-4 whitespace-nowrap">
          <div 
            className="flex items-center gap-1 text-xs cursor-pointer hover:underline" 
            onClick={(e) => handleRatingClick(e, combo)}
            title="View Customer Reviews"
          >
            <span className="text-amber-500">★</span>
            <span className="text-primary font-bold">{(combo.rating || 5.0).toFixed(1)}</span>
            <span className="text-primary opacity-60 font-normal">({combo.reviewCount || 0})</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center justify-center gap-2">
            <EditBtn onClick={() => openEditModal(combo)} />
            <DeleteBtn onClick={() => handleDelete(combo._id || combo.id)} />
            <ViewBtn onClick={() => openViewModal(combo)} />
          </div>
        </td>
      </tr>
    );
  };

  // If a combo context is targeted for review lookups, bypass the grid template completely
  if (selectedComboForReviews) {
    return (
      <ProductReviews 
        combo={selectedComboForReviews} 
        onBack={() => setSelectedComboForReviews(null)} 
      />
    );
  }

  const activeCategory = categories.find(c => c.name === formData.category);
  const subcategoriesList = activeCategory ? activeCategory.subcategories : [];

  const filteredProductsForBundle = availableProducts.filter(prod => {
    // Always show if it's already selected
    const isSelected = formData.selectedItemIds.includes(prod._id || prod.id);
    if (isSelected) return true;

    // Filter by search inside the modal
    if (modalProductSearch && !prod.title.toLowerCase().includes(modalProductSearch.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (formData.category) {
      const prodCatName = prod.category?.name || prod.category;
      if (prodCatName !== formData.category) return false;
    }

    // Filter by subcategory
    if (formData.subcategory) {
      const prodSubCatName = prod.subcategory?.name || prod.subcategory;
      if (prodSubCatName !== formData.subcategory) return false;
    }

    return true;
  });

  return (
    <div className="w-full font-sans text-primary antialiased">
      <ToastContainer />
      <PageHeader
        title="Combo Packs Management"
        subtitle="Manage combo pack variants, pricing, and category assignments to optimize your store offerings and boost sales performance"
      >
        <AddBtn onClick={openAddModal} className="self-start">Add Combo Pack</AddBtn>
      </PageHeader>

      <div className="bg-white border border-gray-200/80 rounded-xl p-4 mb-6 shadow-2xs flex items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 text-primary opacity-50" size={16} />
          <input 
            type="text"
            placeholder="Search combos by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-gray-300 transition-all text-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-gray-205 border-t-primary rounded-full animate-spin"></div>
          <span>Loading combo packs...</span>
        </div>
      ) : (
        <AdminTable
          headers={tableHeaders}
          data={sortedCombos}
          renderRow={renderComboRow}
          onSort={handleSort}
          sortConfig={sortConfig}
          minWidth="min-w-[1000px]"
          emptyMessage="No combo pack variants discovered match the query search filter rules."
        />
      )}

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-primary">
                {isEditMode ? `Edit Combo: ${currentCombo?.name}` : 'Create Custom Combo Pack'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-primary opacity-50 hover:opacity-100 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFormSave} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-medium">
              <div className="md:col-span-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-primary font-semibold outline-none focus:border-gray-300 bg-white" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white font-semibold text-primary outline-none focus:border-gray-300"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Subcategory</label>
                  <select 
                    value={formData.subcategory} 
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white font-semibold text-primary outline-none focus:border-gray-300"
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesList.map(sub => (
                      <option key={sub._id || sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-primary font-bold">Total Price</label>
                    <input type="number" readOnly value={formData.totalPrice} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-primary opacity-60 font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-primary font-bold">Offer Price</label>
                    <input type="number" value={formData.offerPrice} onChange={(e) => setFormData({...formData, offerPrice: Math.max(0, Number(e.target.value))})} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-primary font-bold outline-none" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Description</label>
                  <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-primary font-semibold outline-none bg-white resize-none" />
                </div>
                <SaveBtn>SAVE COMBO</SaveBtn>
              </div>
              
              <div className="md:col-span-7 flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>Select Products to Bundle</span>
                  <input 
                    type="text"
                    placeholder="Search products..."
                    value={modalProductSearch}
                    onChange={(e) => setModalProductSearch(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-semibold outline-none focus:border-gray-300 w-full sm:w-44"
                  />
                </div>
                <div className="overflow-y-auto flex-1 max-h-[380px] custom-scrollbar">
                  <table className="w-full text-left text-xs font-semibold">
                    <tbody className="divide-y divide-gray-100">
                      {filteredProductsForBundle.map((prod) => (
                        <tr key={prod._id || prod.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3">
                            <input 
                              type="checkbox" 
                              checked={formData.selectedItemIds.includes(prod._id || prod.id)} 
                              onChange={() => handleProductSelectionToggle(prod._id || prod.id)} 
                            />
                          </td>
                          <td className="py-3 px-3">
                            {prod.image ? (
                              <img src={formatImageUrl(prod.image)} className="w-9 h-9 object-cover rounded border border-gray-100" />
                            ) : (
                              <div className="w-9 h-9 bg-gray-50 rounded flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-primary">{prod.title}</div>
                            <div className="text-[10px] text-gray-400 font-normal">Stock: {getProductStock(prod)}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-primary">₹{(prod.variants?.[0]?.price || prod.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && currentCombo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-primary">Composition Summary Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-primary opacity-60 hover:opacity-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div>
                <h3 className="text-base font-bold text-primary">{currentCombo.name}</h3>
                {currentCombo.description && (
                  <p className="text-gray-500 mt-1">{currentCombo.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Offer Price</span>
                  <span className="text-sm font-bold text-emerald-600">₹{currentCombo.offerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Original Sum</span>
                  <span className="text-sm font-bold text-gray-500 line-through">₹{currentCombo.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-primary uppercase block tracking-wider text-[10px]">Bundled Products</span>
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 overflow-hidden">
                  {currentCombo.selectedItemIds?.map((prod) => (
                    <div key={prod._id || prod.id} className="flex items-center gap-3 p-3 bg-white">
                      {prod.image ? (
                        <img src={formatImageUrl(prod.image)} className="w-10 h-10 object-cover rounded border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-[9px] text-gray-400">N/A</div>
                      )}
                      <div className="flex-grow">
                        <span className="font-bold text-primary block">{prod.title || prod.name}</span>
                        <span className="text-gray-400 text-[10px]">Stock: {getProductStock(prod)}</span>
                      </div>
                      <span className="font-bold text-primary">₹{(prod.variants?.[0]?.price || prod.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-[#003147] hover:bg-[#009EDB] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">Close View</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboPacks;