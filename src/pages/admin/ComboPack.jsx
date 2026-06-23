import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import AdminTable from '../../components/AdminTable';
import { 
  EditBtn, 
  DeleteBtn, 
  ViewBtn, 
  AddBtn, 
  SaveBtn 
} from '../../components/AdminButtons';
import { toast, ToastContainer } from '../../components/Toast'; 
import PageHeader from '../../components/PageHeader';
import ProductReviews from './ProductReviews'; // Ensure the import path points to your reviews file

const INITIAL_COMBOS = [
  {
    sNo: 1,
    preview: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60",
    name: "Combo Pack Premium Alpha",
    offerPrice: 3000.00,
    totalPrice: 2781.00,
    status: true,
    rating: 4.5,
    reviewCount: 2,
    category: "Garden Products",
    subcategory: "Fertilizers & Soil Amendments",
    description: "Premium items grouped together for gardening health.",
    selectedItemIds: ["m1", "m3", "m4", "m6"],
    reviews: [
      { id: 1, userName: "Aarav Sharma", rating: 5, date: "2026-05-12", comment: "Outstanding premium quality! Highly recommend." },
      { id: 2, userName: "Priya Patel", rating: 4, date: "2026-06-01", comment: "Beautiful finish, though delivery took an extra day." }
    ]
  },
  {
    sNo: 2,
    preview: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60",
    name: "Eco-Grow Mini Bundle",
    offerPrice: 800.00,
    totalPrice: 858.00,
    status: true,
    rating: 4.0,
    reviewCount: 1,
    category: "Garden Products",
    subcategory: "Organic Feeds",
    description: "Essential micro-nutrients to build strong base crops.",
    selectedItemIds: ["m1", "m7"],
    reviews: [
      { id: 1, userName: "Vikram Singh", rating: 4, date: "2026-06-10", comment: "Good quality, compact packaging." }
    ]
  },
  {
    sNo: 3,
    preview: "https://images.unsplash.com/photo-1608962714006-29907c0864f6?w=150&auto=format&fit=crop&q=60",
    name: "Orchard Quick Starter",
    offerPrice: 1200.00,
    totalPrice: 1632.00,
    status: true,
    rating: 0.0,
    reviewCount: 0,
    category: "Garden Products",
    subcategory: "Tools & Equipment",
    description: "Handpicked tools combined with nutrient boosters.",
    selectedItemIds: ["m4", "m8"],
    reviews: []
  }
];

const AVAILABLE_PRODUCTS = [
  { id: "m1", name: "Bio-Organic Nitrogen Mix", category: "Garden Products", subcategory: "Fertilizers & Soil Amendments", price: 1111.00, stock: 106, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60" },
  { id: "m2", name: "Potting Soil Super Soil", category: "Garden Products", subcategory: "Fertilizers & Soil Amendments", price: 1112.00, stock: 4, image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60" },
  { id: "m3", name: "Premium Vermicompost Pack", category: "Garden Products", subcategory: "Fertilizers & Soil Amendments", price: 520.00, stock: 3, image: "https://images.unsplash.com/photo-1608962714006-29907c0864f6?w=150&auto=format&fit=crop&q=60" },
  { id: "m4", name: "Liquid Seaweed Extract", category: "Garden Products", subcategory: "Organic Feeds", price: 600.00, stock: 39, image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60" },
  { id: "m5", name: "Bone Meal Root Booster", category: "Garden Products", subcategory: "Organic Feeds", price: 450.00, stock: 14, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60" },
  { id: "m6", name: "Epsom Salt Soil Enhancer", category: "Garden Products", subcategory: "Fertilizers & Soil Amendments", price: 550.00, stock: 4, image: "https://images.unsplash.com/photo-1608962714006-29907c0864f6?w=150&auto=format&fit=crop&q=60" },
  { id: "m7", name: "Ergonomic Hand Trowel Tool", category: "Garden Products", subcategory: "Tools & Equipment", price: 250.00, stock: 18, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60" },
  { id: "m8", name: "Heavy Duty Pruning Shears", category: "Garden Products", subcategory: "Tools & Equipment", price: 950.00, stock: 0, image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60" },
  { id: "m9", name: "Neem Oil Spray Pest Guard", category: "Garden Products", subcategory: "Pest Control", price: 380.00, stock: 25, image: "https://images.unsplash.com/photo-1608962714006-29907c0864f6?w=150&auto=format&fit=crop&q=60" }
];

const ComboPacks = () => {
  const [combos, setCombos] = useState(INITIAL_COMBOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sNo', direction: 'asc' });

  // State hook to selectively toggle sub-view layer
  const [selectedComboForReviews, setSelectedComboForReviews] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Garden Products',
    subcategory: 'Fertilizers & Soil Amendments',
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

  const toggleStatus = (id) => {
    setCombos(prev => prev.map(c => c.sNo === id ? { ...c, status: !c.status } : c));
    toast.info("Combo activation status modified.");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this combo pack record?")) {
      setCombos(prev => prev.filter(c => c.sNo !== id));
      toast.error("Combo pack deleted successfully.");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      category: 'Garden Products',
      subcategory: 'Fertilizers & Soil Amendments',
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
    setFormData({
      name: combo.name,
      category: combo.category,
      subcategory: combo.subcategory,
      totalPrice: combo.totalPrice,
      offerPrice: combo.offerPrice,
      description: combo.description,
      selectedItemIds: combo.selectedItemIds
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

      const currentSelectedProducts = AVAILABLE_PRODUCTS.filter(p => updatedIds.includes(p.id));
      const collectiveSum = currentSelectedProducts.reduce((acc, current) => acc + current.price, 0);

      return {
        ...prev,
        selectedItemIds: updatedIds,
        totalPrice: collectiveSum > 0 ? collectiveSum : ''
      };
    });
  };

  const handleFormSave = (e) => {
    e.preventDefault();
    const cleanOfferPrice = Math.max(0, Number(formData.offerPrice) || 0);

    if (!formData.name || formData.selectedItemIds.length === 0) {
      toast.warning("Please provide a valid combo name and select at least one item.");
      return;
    }

    if (isEditMode) {
      setCombos(prev => prev.map(c => c.sNo === currentCombo.sNo ? {
        ...c,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        totalPrice: Number(formData.totalPrice),
        offerPrice: cleanOfferPrice,
        description: formData.description,
        selectedItemIds: formData.selectedItemIds
      } : c));
      toast.success("Combo settings updated successfully.");
    } else {
      const newCombo = {
        sNo: combos.length + 1,
        preview: AVAILABLE_PRODUCTS.find(p => p.id === formData.selectedItemIds[0])?.image || null,
        name: formData.name,
        offerPrice: cleanOfferPrice,
        totalPrice: Number(formData.totalPrice) || 0,
        status: true,
        rating: 0.0,
        reviewCount: 0,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        selectedItemIds: formData.selectedItemIds,
        reviews: []
      };
      setCombos(prev => [...prev, newCombo]);
      toast.success("New custom combo package added to live store.");
    }
    setIsFormModalOpen(false);
  };

  const filteredCombos = combos.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCombos = [...filteredCombos].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const renderComboRow = (combo) => {
    const internalProducts = AVAILABLE_PRODUCTS.filter(p => combo.selectedItemIds.includes(p.id));
    return (
      <tr key={combo.sNo} className="hover:bg-slate-50/50 transition-colors font-medium">
        <td className="py-4 px-4 text-primary">{combo.sNo}</td>
        <td className="py-4 px-4">
          {combo.preview ? (
            <img src={combo.preview} alt={combo.name} className="w-12 h-12 object-cover rounded-md border border-gray-100" />
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
            {internalProducts.map((p) => (
              <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${p.stock === 0 ? 'bg-red-50 text-red-500 border-red-200' : 'bg-emerald-50 text-primary border-emerald-200'}`}>
                {p.stock}
              </span>
            ))}
          </div>
        </td>
        <td className="py-4 px-4">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" checked={combo.status} onChange={() => toggleStatus(combo.sNo)} className="sr-only peer" />
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
            <span className="text-primary font-bold">{combo.rating.toFixed(1)}</span>
            <span className="text-primary opacity-60 font-normal">({combo.reviewCount})</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center justify-center gap-2">
            <EditBtn onClick={() => openEditModal(combo)} />
            <DeleteBtn onClick={() => handleDelete(combo.sNo)} />
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

      <AdminTable
        headers={tableHeaders}
        data={sortedCombos}
        renderRow={renderComboRow}
        onSort={handleSort}
        sortConfig={sortConfig}
        minWidth="min-w-[1000px]"
        emptyMessage="No combo pack variants discovered match the query search filter rules."
      />

      {/* Form Modal & View Composition Modals Code remains exactly the same below */}
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
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-primary font-semibold outline-none focus:border-gray-300 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white font-semibold text-primary outline-none focus:border-gray-300"><option value="Garden Products">Garden Products</option></select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Subcategory</label>
                  <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white font-semibold text-primary outline-none focus:border-gray-300"><option value="Fertilizers & Soil Amendments">Fertilizers & Soil Amendments</option><option value="Organic Feeds">Organic Feeds</option><option value="Tools & Equipment">Tools & Equipment</option><option value="Pest Control">Pest Control</option></select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-primary font-bold">Total Price</label>
                    <input type="number" readOnly value={formData.totalPrice} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-primary opacity-60 font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-primary font-bold">Offer Price</label>
                    <input type="number" value={formData.offerPrice} onChange={(e) => setFormData({...formData, offerPrice: Math.max(0, Number(e.target.value))})} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-primary font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-primary font-bold">Description</label>
                  <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-primary font-semibold outline-none bg-white resize-none" />
                </div>
                <SaveBtn>SAVE COMBO</SaveBtn>
              </div>
              <div className="md:col-span-7 flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-y-auto flex-1 max-h-[380px]">
                  <table className="w-full text-left text-xs font-semibold">
                    <tbody className="divide-y divide-gray-100">
                      {AVAILABLE_PRODUCTS.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3"><input type="checkbox" checked={formData.selectedItemIds.includes(prod.id)} onChange={() => handleProductSelectionToggle(prod.id)} /></td>
                          <td className="py-3 px-3"><img src={prod.image} className="w-9 h-9 object-cover rounded" /></td>
                          <td className="py-3 px-3"><div className="font-bold">{prod.name}</div></td>
                          <td className="py-3 px-3 text-right font-bold">₹{prod.price.toFixed(2)}</td>
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
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold">Composition Summary Details</h2>
              <button onClick={() => setIsViewModalOpen(false)}><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 text-xs"><h3 className="text-base font-bold">{currentCombo.name}</h3><button onClick={() => setIsViewModalOpen(false)} className="bg-primary text-white px-4 py-2 rounded-lg text-xs mt-4">Close View</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboPacks;