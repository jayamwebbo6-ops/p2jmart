import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Info, 
  Copy, 
  AlertCircle,
  Percent,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { getAllCouponsAPI } from '../../api/couponApi';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // tabs: all, active, inactive
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await getAllCouponsAPI();
        if (res && res.success) {
          setCoupons(res.data);
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter based purely on Active / Inactive status fields
  const filteredCoupons = coupons.filter(coupon => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return coupon.status === 'Active';
    if (activeTab === 'inactive') return coupon.status === 'Inactive';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50/30">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Status Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
          {[
            { id: 'all', label: 'All Vouchers', icon: Ticket },
            { id: 'active', label: 'Active Deals', icon: CheckCircle2 },
            { id: 'inactive', label: 'Expired / Inactive', icon: XCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  isTabActive
                    ? 'border-[#002B49] text-[#002B49] bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <TabIcon size={14} className={isTabActive ? 'text-blue-600' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Coupon Cards Grid */}
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl text-xs text-slate-400 flex flex-col items-center gap-3 shadow-2xs">
            <AlertCircle size={32} className="text-slate-300 animate-pulse" />
            <span>No vouchers found matching this status filter.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => {
              const isPercentage = coupon.discountType === 'Percentage (%)';
              const isCouponActive = coupon.status === 'Active';

              return (
                <div 
                  key={coupon._id} 
                  className={`bg-white rounded-2xl flex border transition-all duration-300 relative shadow-2xs group ${
                    !isCouponActive ? 'opacity-65 grayscale border-slate-200' : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Left Ticket Stub Panel */}
                  <div className="w-28 sm:w-36 flex flex-col items-center justify-center p-4 rounded-l-2xl border-r-2 border-dashed border-slate-200 bg-slate-50/50 relative select-none">
                    {/* Decorative Punch Holes */}
                    <div className="absolute top-0 right-0 translate-x-[50%] -translate-y-[50%] w-4 h-4 bg-white rounded-full border border-slate-200 z-10"></div>
                    <div className="absolute bottom-0 right-0 translate-x-[50%] translate-y-[50%] w-4 h-4 bg-white rounded-full border border-slate-200 z-10"></div>
                    
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      {isPercentage ? (
                        <Percent size={18} strokeWidth={2.5} />
                      ) : (
                        <Ticket size={18} strokeWidth={2.5} />
                      )}
                    </div>
                    
                    <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                      {isPercentage ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-1 text-center">
                      {isPercentage ? 'Percent Off' : 'Flat Cash'}
                    </span>
                  </div>

                  {/* Right Content Panel */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isCouponActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {coupon.status}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={11} /> {formatDate(coupon.validityFrom)} - {formatDate(coupon.validityTo)}
                        </span>
                      </div>
                      
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-snug pt-0.5">
                        {coupon.title}
                      </h3>

                     
                    </div>

                    {/* Operational Footer - Controls Action Code */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 w-full justify-between">
                        <button
                          type="button"
                          disabled={!isCouponActive}
                          onClick={() => handleCopyCode(coupon._id, coupon.code)}
                          className={`bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 select-none transition-all group/code ${
                            isCouponActive ? 'hover:bg-slate-100 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="font-mono text-xs font-black text-slate-700 tracking-wide">
                            {coupon.code}
                          </span>
                          {copiedId === coupon._id ? (
                            <span className="text-[9px] text-emerald-600 font-bold animate-fadeIn">Copied!</span>
                          ) : (
                            isCouponActive && <Copy size={11} className="text-slate-400 group-hover/code:text-slate-600" />
                          )}
                        </button>
                        
                        <div className="flex flex-col text-[10px] text-slate-500 font-medium leading-tight text-right">
                          <span>Min Order: <strong>₹{coupon.minOrderAmount}</strong></span>
                          {isPercentage && coupon.maxDiscountAmount > 0 && (
                            <span className="text-amber-700 font-bold">Max Discount: ₹{coupon.maxDiscountAmount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Fine Print Footnote */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-400 flex items-start gap-2 shadow-2xs">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-normal">
            <strong>System Dynamic Processing:</strong> Vouchers calculate discount reductions automatically checkout time based on minimum spending benchmarks and account eligibility criteria verified against your active account portfolio log.
          </span>
        </div>

      </div>
    </div>
  );
};

export default Coupons;