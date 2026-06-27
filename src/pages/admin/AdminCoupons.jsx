import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Wand2,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable'; // Adjust path if needed

const AdminCoupons = () => {
  // Coupon System Records Matrix State
  const [coupons, setCoupons] = useState([
    {
      code: 'FURN5000',
      status: 'Active',
      discountType: 'Fixed Amount (₹)',
      discountValue: 5000,
      maxDiscountAmount: 0, // 0 means not applicable / no cap needed for flat
      minOrderAmount: 45000,
      validityFrom: '2026-06-01',
      validityTo: '2026-06-30',
      applicableForActiveUsersOnly: true, // Hidden background rule
      isSingleUse: true // Hidden background rule
    }
  ]);

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

  // Toggle Status directly inside row elements callback
  const toggleStatus = (codeToFind) => {
    setCoupons(prev => prev.map((coupon) => {
      if (coupon.code === codeToFind) {
        return { ...coupon, status: coupon.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return coupon;
    }));
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
  const handleSubmit = (e) => {
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

    setCoupons(prev => [
      ...prev, 
      {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: isPct ? Number(formData.maxDiscountAmount) : 0,
        // Automatically forced rules embedded directly into the record schema matrix
        applicableForActiveUsersOnly: true, 
        isSingleUse: true 
      }
    ]);

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
  };

  const tableHeaders = [
    { label: 'Code', key: 'code', sortable: true, align: 'left' },
    { label: 'Type / Value', key: 'discountValue', sortable: true, align: 'left' },
    { label: 'Constraints & Context Rules', key: 'minOrderAmount', sortable: true, align: 'left' },
    { label: 'Validation Window', key: 'validityTo', sortable: true, align: 'left' },
    { label: 'Status', key: 'status', sortable: true, align: 'center' }
  ];

  const renderCouponRow = (coupon, index) => {
    const isPct = coupon.discountType === 'Percentage (%)';
    return (
      <tr key={coupon.code || index} className="hover:bg-gray-50/50 transition-colors select-none">
        <td className="py-4 px-3 font-mono font-bold text-gray-900">{coupon.code}</td>
        
        <td className="py-4 px-3">
          <div className="font-semibold text-gray-800">
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
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-800"><Calendar size={10} /> To: {coupon.validityTo}</div>
        </td>
        
        <td className="py-4 px-3 text-center">
          <button
            type="button"
            onClick={() => toggleStatus(coupon.code)}
            className="focus:outline-none inline-flex items-center justify-center cursor-pointer"
          >
            {coupon.status === 'Active' ? (
              <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]">
                <ToggleRight size={14} /> Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]">
                <ToggleLeft size={14} /> Inactive
              </span>
            )}
          </button>
        </td>
      </tr>
    );
  };

  const isPercentageSelected = formData.discountType === 'Percentage (%)';

  return (
    <div className="font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader title="Coupons Management" subtitle="Manage system rule-bounded vouchers" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Side Panel input container component */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 lg:col-span-1">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <PlusCircle className="text-primary" size={18} />
              <h2 className="text-base font-bold text-gray-800">Create New Coupon</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    name="code"
                    placeholder="e.g. SUMMER26"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-gray-300 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    className="absolute right-2 p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    title="Auto-generate code formula"
                  >
                    <Wand2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Status *
                </label>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Active" 
                      checked={formData.status === 'Active'}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Inactive" 
                      checked={formData.status === 'Inactive'}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Discount Type *
                </label>
                <select 
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="Fixed Amount (₹)">Fixed Amount (₹)</option>
                  <option value="Percentage (%)">Percentage (%)</option>
                </select>
              </div>

              {/* Dynamic Field: Input changes naming and configuration based on option selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {isPercentageSelected ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                </label>
                <input 
                  type="number"
                  name="discountValue"
                  placeholder={isPercentageSelected ? 'e.g. 15' : 'e.g. 500'}
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Min Order Amount (₹) *
                </label>
                <input 
                  type="number"
                  name="minOrderAmount"
                  placeholder="Applies only above this amount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Dynamic Field: Maximum Discount Amount field visible only when Percentage (%) option is checked */}
              {isPercentageSelected && (
                <div>
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Maximum Discount Amount (₹) *
                  </label>
                  <input 
                    type="number"
                    name="maxDiscountAmount"
                    placeholder="e.g. 1500 (Enforced limit cap)"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-amber-300 bg-amber-50/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 animate-fadeIn"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Validity From *
                  </label>
                  <input 
                    type="date"
                    name="validityFrom"
                    value={formData.validityFrom}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-gray-300 rounded-xl px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Validity To *
                  </label>
                  <input 
                    type="date"
                    name="validityTo"
                    value={formData.validityTo}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-gray-300 rounded-xl px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-xs hover:bg-opacity-95 transition-all cursor-pointer mt-2"
              >
                Save Coupon
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <AdminTable
              headers={tableHeaders}
              data={coupons}
              renderRow={renderCouponRow}
              onSort={handleSort}
              sortConfig={sortConfig}
              minWidth="min-w-[700px]"
              emptyMessage="No vouchers discovered inside the system backend currently."
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;