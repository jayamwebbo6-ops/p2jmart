import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Info, 
  Copy, 
  Percent,
} from 'lucide-react';
import { getEligibleCouponsAPI } from '../../api/couponApi';
import { toast } from '../../components/toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); 
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await getEligibleCouponsAPI();
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

  const handleCopyCode = (coupon) => {
    if (coupon.isExhausted) {
      toast.error('You have already used this coupon code to its maximum limit.');
      return;
    }
    if (coupon.status !== 'Active') {
      toast.error('This coupon is currently inactive and cannot be copied.');
      return;
    }
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    <div className="w-full min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans bg-slate-50/50 selection:bg-primary/10 antialiased">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">

        {/* Status Tab Filters */}
        <div className="flex flex-row overflow-x-auto scrollbar-none items-center gap-1.5 border-b border-slate-200 pb-px -mx-3 px-3 sm:mx-0 sm:px-0 w-[calc(100%+24px)] sm:w-full">
          {[
            { id: 'all', label: 'All Vouchers', icon: Ticket },
            { id: 'active', label: 'Active Deals', icon: CheckCircle2 },
            { id: 'inactive', label: 'Expired', icon: XCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer shrink-0 ${
                  isTabActive
                    ? 'border-[#002B49] text-[#002B49] bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <TabIcon size={13} className={isTabActive ? 'text-primary' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="w-full bg-white h-44 sm:h-36 rounded-2xl border border-slate-200 animate-pulse flex flex-col sm:flex-row">
                <div className="h-16 sm:h-full w-full sm:w-32 bg-slate-100/60 rounded-t-2xl sm:rounded-tr-none sm:rounded-l-2xl border-b sm:border-b-0 sm:border-r border-dashed border-slate-200"></div>
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-3 bg-slate-200 rounded-sm w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded-sm w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Dynamic Grid Matrix (Stays single column on mobile, changes smoothly to 2 columns on desktops) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredCoupons.map((coupon) => {
              const isPercentage = coupon.discountType === 'Percentage (%)';
              const isCouponActive = coupon.status === 'Active';

              return (
                <div 
                  key={coupon._id} 
                  className={`bg-white rounded-2xl flex flex-col sm:flex-row border transition-all duration-200 relative w-full group ${
                    !isCouponActive ? 'opacity-60 grayscale border-slate-200' : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Left Panel: Switches behavior responsively */}
                  <div className="w-full sm:w-28 md:w-32 flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-4 rounded-t-2xl sm:rounded-tr-none sm:rounded-l-2xl border-b sm:border-b-0 sm:border-r border-dashed border-slate-200 bg-slate-50/50 relative select-none shrink-0 gap-2">
                    
                    {/* Decorative Cutout Punch Holes (Hidden on mobile vertical stack to maintain alignment) */}
                    <div className="hidden sm:block absolute top-0 right-0 translate-x-[50%] -translate-y-[50%] w-3.5 h-3.5 bg-slate-50 border border-slate-200 rounded-full z-10"></div>
                    <div className="hidden sm:block absolute bottom-0 right-0 translate-x-[50%] translate-y-[50%] w-3.5 h-3.5 bg-slate-50 border border-slate-200 rounded-full z-10"></div>
                    
                    <div className="flex items-center sm:flex-col gap-2.5 sm:gap-0 sm:justify-center w-full">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center sm:mb-2 shrink-0">
                        {isPercentage ? <Percent size={14} strokeWidth={2.5} /> : <Ticket size={14} strokeWidth={2.5} />}
                      </div>
                      
                      <div className="flex flex-col sm:items-center">
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                          {isPercentage ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest mt-0.5 sm:mt-1.5 text-left sm:text-center whitespace-nowrap">
                          {isPercentage ? 'Percent Off' : 'Cash Back'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content Panel */}
                  <div className="flex-1 p-4 flex flex-col justify-between gap-3.5 min-w-0">
                    <div className="space-y-1.5 min-w-0">
                      {/* Metadata Inline Row */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className={`font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          coupon.isExhausted ? 'bg-slate-100 text-slate-500 border border-slate-300' :
                          isCouponActive ? 'bg-green-50 text-green-700 border border-green-200/40' : 'bg-red-50 text-red-700'
                        }`}>
                          {coupon.isExhausted ? 'Limit Reached' : coupon.status}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Clock size={11} className="text-slate-300" /> 
                          <span>{formatDate(coupon.validityFrom)} - {formatDate(coupon.validityTo)}</span>
                        </span>
                      </div>
                      
                      {/* Title Header */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug truncate pr-1">
                        {coupon.title}
                      </h3>
                    </div>

                    {/* Operational Code Button & Conditions Area */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon)}
                        className={`w-full border rounded-lg py-2 px-3 flex items-center justify-center gap-2 select-none transition-all ${
                          !isCouponActive || coupon.isExhausted 
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 cursor-pointer active:scale-[0.99]'
                        } group`}
                      >
                        <span className={`font-mono text-xs font-bold tracking-[0.15em] uppercase truncate ${
                          coupon.isExhausted ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}>
                          {coupon.code}
                        </span>
                        {copiedId === coupon._id ? (
                          <span className="text-[10px] text-emerald-600 font-bold shrink-0 animate-pulse">Copied!</span>
                        ) : (
                          !coupon.isExhausted && isCouponActive && <Copy size={11} className="text-slate-400 shrink-0 group-hover:text-slate-500 transition-colors" />
                        )}
                      </button>
                      
                      {/* Conditions Subtext */}
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 px-0.5">
                        <span>Min Order: <strong className="text-slate-600 font-semibold">₹{coupon.minOrderAmount}</strong></span>
                        {isPercentage && coupon.maxDiscountAmount > 0 && (
                          <span className="text-amber-700 font-semibold">Max Disc: ₹{coupon.maxDiscountAmount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Fine Print Footnote */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-slate-400 flex items-start gap-2 shadow-3xs">
          <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <span className="text-[10px] sm:text-[11px] leading-normal font-medium text-slate-400">
            <strong className="text-slate-500 font-bold">System Dynamic Processing:</strong> Vouchers calculate discount reductions automatically at checkout based on minimum spending benchmarks and account eligibility criteria.
          </span>
        </div>

      </div>
    </div>
  );
};

export default Coupons;