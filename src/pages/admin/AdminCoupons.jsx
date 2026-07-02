import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Wand2,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';
import { AddBtn, SaveBtn, CancelBtn, DeleteBtn } from '../../components/AdminButtons';
import { 
  getAllCouponsAPI, 
  createCouponAPI, 
  toggleCouponStatusAPI, 
  deleteCouponAPI 
} from '../../api/couponApi';
import { toast } from '../../components/toast';

const AdminCoupons = () => {
  // Coupon System Records State
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState(null);

  // Sorting Metadata Config State tracking
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Form Field States
  const [formData, setFormData] = useState({
    code: '',
    status: 'Active',
    discountType: 'Fixed Amount (₹)',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    validityFrom: '',
    validityTo: ''
  });

  const [error, setError] = useState('');

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Automatically generates code sequence
  const handleAutoGenerateCode = () => {
    const isPct = formData.discountType === 'Percentage (%)';
    const prefix = isPct ? 'PERC' : 'CASH';
    
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const valueAppend = formData.discountValue ? formData.discountValue : Math.floor(100 + Math.random() * 900);
    
    const finalGeneratedCode = `${prefix}${valueAppend}-${randomHex}`;
    
    setFormData(prev => ({
      ...prev,
      code: finalGeneratedCode
    }));
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCouponsAPI();
      if (res && res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      toast.error('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Toggle Status directly inside row elements callback
  const toggleStatus = async (couponId) => {
    try {
      const res = await toggleCouponStatusAPI(couponId);
      if (res && res.success) {
        toast.success(res.message || 'Status updated successfully.');
        loadCoupons();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Failed to update status.');
    }
  };

  // Open the delete confirmation modal
  const handleDeleteCoupon = (coupon) => {
    setDeleteConfirmCoupon(coupon);
  };

  // Confirmed — execute permanent delete
  const confirmDeleteCoupon = async () => {
    if (!deleteConfirmCoupon) return;
    try {
      const res = await deleteCouponAPI(deleteConfirmCoupon._id);
      if (res && res.success) {
        toast.success(res.message || 'Coupon deleted successfully.');
        loadCoupons();
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      toast.error('Failed to delete coupon.');
    } finally {
      setDeleteConfirmCoupon(null);
    }
  };

  // Sort function mapped directly into the AdminTable framework
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    setCoupons(prev => [...prev].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isPct = formData.discountType === 'Percentage (%)';

    // Base validation criteria check
    if (!formData.code || !formData.discountValue || !formData.minOrderAmount || !formData.validityFrom || !formData.validityTo) {
      setError('Please fill in all required coupon parameters.');
      return;
    }

    // Dynamic constraint check for percentage variants
    if (isPct && !formData.maxDiscountAmount) {
      setError('Maximum Discount Amount field is mandatory for Percentage campaigns.');
      return;
    }

    if (new Date(formData.validityFrom) > new Date(formData.validityTo)) {
      setError('"Validity From" date cannot be after the "Validity To" date.');
      return;
    }

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        status: formData.status,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: isPct ? Number(formData.maxDiscountAmount) : 0,
        validityFrom: formData.validityFrom,
        validityTo: formData.validityTo,
        applicableForActiveUsersOnly: true,
        isSingleUse: true
      };

      const res = await createCouponAPI(payload);
      if (res && res.success) {
        toast.success(res.message || 'Coupon added successfully!');
        
        // Reset Form
        setFormData({
          code: '',
          status: 'Active',
          discountType: 'Fixed Amount (₹)',
          discountValue: '',
          maxDiscountAmount: '',
          minOrderAmount: '',
          validityFrom: '',
          validityTo: ''
        });

        setIsAddModalOpen(false);
        loadCoupons();
      }
    } catch (err) {
      console.error('Failed to create coupon:', err);
      const errMsg = err.response?.data?.message || 'Failed to create coupon.';
      setError(errMsg);
    }
  };

  const tableHeaders = [
    { label: 'Code', key: 'code', sortable: true, align: 'left' },
    { label: 'Type / Value', key: 'discountValue', sortable: true, align: 'left' },
    { label: 'Constraints & Context Rules', key: 'minOrderAmount', sortable: true, align: 'left' },
    { label: 'Validation Window', key: 'validityTo', sortable: true, align: 'left' },
    { label: 'Status', key: 'status', sortable: true, align: 'center' },
    { label: 'Actions', key: 'actions', sortable: false, align: 'center' }
  ];

  const renderCouponRow = (coupon, index) => {
    const isPct = coupon.discountType === 'Percentage (%)';
    return (
      <tr key={coupon._id || index} className="hover:bg-gray-50/50 transition-colors select-none text-xs font-semibold text-slate-700">
        <td className="py-4 px-3 font-mono font-bold text-gray-900">{coupon.code}</td>
        
        <td className="py-4 px-3">
          <div className="font-bold text-gray-800">
            {isPct ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
          </div>
          <div className="text-[10px] text-gray-400">{coupon.discountType}</div>
        </td>
        
        <td className="py-4 px-3 space-y-1 text-xs text-gray-600">
          <div>Min Order Amount: <span className="font-bold text-gray-900">₹{coupon.minOrderAmount}</span></div>
          {isPct && (
            <div>Max Discount Cap: <span className="font-bold text-amber-700">₹{coupon.maxDiscountAmount}</span></div>
          )}
        </td>
        
        <td className="py-4 px-3 text-gray-500 space-y-0.5">
          <div className="flex items-center gap-1 text-[11px]"><Calendar size={10} /> From: {coupon.validityFrom}</div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-850"><Calendar size={10} /> To: {coupon.validityTo}</div>
        </td>
        
        <td className="py-4 px-3 text-center">
          <div className="inline-flex items-center justify-center">
            <button
              type="button"
              onClick={() => toggleStatus(coupon._id)}
              className="group relative flex items-center gap-2 focus:outline-none cursor-pointer"
              title="Toggle coupon status"
            >
              {/* iOS Style Switch Background */}
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-250 ${
                coupon.status === 'Active' ? 'bg-[#002B49]' : 'bg-slate-200'
              }`}>
                {/* Knob */}
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-250 ${
                  coupon.status === 'Active' ? 'translate-x-3.5' : 'translate-x-0'
                }`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                coupon.status === 'Active' ? 'text-green-600' : 'text-slate-400'
              }`}>
                {coupon.status}
              </span>
            </button>
          </div>
        </td>
        
        <td className="py-4 px-3 text-center">
          <div className="flex items-center justify-center">
            <DeleteBtn 
              onClick={() => handleDeleteCoupon(coupon)} 
              title="Delete Coupon"
            />
          </div>
        </td>
      </tr>
    );
  };

  const isPercentageSelected = formData.discountType === 'Percentage (%)';

  return (
    <div className="font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <PageHeader title="Coupons Management" subtitle="Manage system rule-bounded vouchers">
          <AddBtn
            onClick={() => {
              setError('');
              setIsAddModalOpen(true);
            }}
          >
            Add Coupon
          </AddBtn>
        </PageHeader>

      
          <AdminTable
            headers={tableHeaders}
            data={coupons}
            renderRow={renderCouponRow}
            onSort={handleSort}
            sortConfig={sortConfig}
            minWidth="min-w-[800px]"
            emptyMessage="No vouchers discovered inside the system backend currently."
          />
   

        {/* CREATE COUPON POPUP MODAL */}
        {isAddModalOpen && (
          <div 
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-fadeIn"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="text-primary animate-pulse" size={18} />
                  <h2 className="text-base font-bold text-slate-800">Create New Coupon</h2>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  type="button" 
                  className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-shake">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Coupon Code *
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type="text"
                        name="code"
                        placeholder="e.g. SUMMER26"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-gray-250 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAutoGenerateCode}
                        className="absolute right-2 p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                        title="Auto-generate code formula"
                      >
                        <Wand2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Status *
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          status: prev.status === 'Active' ? 'Inactive' : 'Active'
                        }))}
                        className="flex items-center gap-2.5 focus:outline-none cursor-pointer"
                        title="Toggle status"
                      >
                        {/* Sliding toggle container */}
                        <div className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-250 ${
                          formData.status === 'Active' ? 'bg-[#002B49]' : 'bg-slate-200'
                        }`}>
                          {/* Sliding knob */}
                          <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transform transition-transform duration-250 ${
                            formData.status === 'Active' ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </div>
                        <span className={`text-xs font-bold tracking-wide transition-colors ${
                          formData.status === 'Active' ? 'text-green-600' : 'text-slate-500'
                        }`}>
                          {formData.status}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Discount Type *
                    </label>
                    <select 
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-gray-250 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                    >
                      <option value="Fixed Amount (₹)">Fixed Amount (₹)</option>
                      <option value="Percentage (%)">Percentage (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {isPercentageSelected ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input 
                      type="number"
                      name="discountValue"
                      placeholder={isPercentageSelected ? 'e.g. 15' : 'e.g. 500'}
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Min Order Amount (₹) *
                    </label>
                    <input 
                      type="number"
                      name="minOrderAmount"
                      placeholder="Applies only above this"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                    />
                  </div>

                  {isPercentageSelected ? (
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                        Max Discount Cap (₹) *
                      </label>
                      <input 
                        type="number"
                        name="maxDiscountAmount"
                        placeholder="e.g. 1500 (limit cap)"
                        value={formData.maxDiscountAmount}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-amber-305 bg-amber-50/20 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-bold"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end pb-1 text-[10px] text-gray-400 font-medium italic">
                      No cap needed for Flat/Fixed cash discount campaigns.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Validity From *
                    </label>
                    <input 
                      type="date"
                      name="validityFrom"
                      value={formData.validityFrom}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Validity To *
                    </label>
                    <input 
                      type="date"
                      name="validityTo"
                      value={formData.validityTo}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                  <CancelBtn onClick={() => setIsAddModalOpen(false)} />
                  <SaveBtn type="submit">Save Coupon</SaveBtn>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmCoupon && (
          <div
            onClick={() => setDeleteConfirmCoupon(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-600" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Delete Coupon</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCoupon(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete the coupon
                </p>
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <Trash2 size={14} className="text-red-500 shrink-0" />
                  <span className="font-mono font-black text-red-700 text-sm tracking-wider">
                    {deleteConfirmCoupon.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  This action cannot be undone. All usage data tied to this coupon code will be permanently removed.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCoupon(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCoupon}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={12} />
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCoupons;