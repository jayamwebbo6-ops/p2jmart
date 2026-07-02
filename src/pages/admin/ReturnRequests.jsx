import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { Search, X, ShieldAlert, Check, RefreshCw, Eye, Package, User, Clock, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';
import { toast, ToastContainer } from '../../components/toast';
import { API_URL } from '../../api/api';
import {
  adminGetReturnRequestsAPI,
  adminReviewReturnAPI,
  adminReceiveParcelAPI,
  adminRefundItemAPI
} from '../../api/orderApi';
import ConfirmationModal from '../../components/ConfirmationModal';

const ReturnRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [sortConfig, setSortConfig] = useState({ key: 'returnRequestDate', direction: 'desc' });

  // Interactive Dialog Modal Triggers
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDanger: false
  });

  // Fetch return requests
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await adminGetReturnRequestsAPI();
      if (res && res.success) {
        setRequests(res.data);
      } else {
        toast.error(res.message || 'Failed to fetch return requests');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error fetching return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Summary Metrics Board
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.returnStatus === 'Return Requested').length;
  const approvedRequests = requests.filter(r => r.returnStatus === 'Return Approved').length;
  const refundedRequests = requests.filter(r => r.returnStatus === 'Returned & Refunded').length;

  // Search filter logic
  const filteredRequests = requests.filter(req => 
    req.orderCode.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    req.productName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    req.userName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    req.mobileNo.includes(debouncedSearchQuery)
  );

  // Sort Handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const formatImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) {
      return path;
    }
    const cleanSrc = path.startsWith('/') ? path.slice(1) : path;
    return `${API_URL}/${cleanSrc}`;
  };

  // Actions execution
  const handleReviewReturn = async (action) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await adminReviewReturnAPI(selectedRequest.orderId, selectedRequest.itemId, action);
      if (res && res.success) {
        toast.success(`Return request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        loadRequests();
        setIsViewModalOpen(false);
      } else {
        toast.error(res.message || 'Failed to process review');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error processing review action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveParcel = (reqItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Receive Parcel',
      message: `Are you sure you want to mark parcel as received for Order #${reqItem.orderCode}?`,
      isDanger: false,
      onConfirm: async () => {
        try {
          const res = await adminReceiveParcelAPI(reqItem.orderId, reqItem.itemId);
          if (res && res.success) {
            toast.success('Parcel marked as received.');
            loadRequests();
          } else {
            toast.error(res.message || 'Failed to mark parcel as received');
          }
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Error marking parcel as received');
        }
      }
    });
  };

  const handleRefundItem = (reqItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Issue Refund & Restock',
      message: `Confirm issuing refund for Order #${reqItem.orderCode}? This will also restock the items.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminRefundItemAPI(reqItem.orderId, reqItem.itemId);
          if (res && res.success) {
            toast.success('Refund processed successfully.');
            loadRequests();
          } else {
            toast.error(res.message || 'Failed to process refund');
          }
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Error processing refund');
        }
      }
    });
  };

  const tableHeaders = [
    { key: 'orderCode', label: 'ORDER ID', sortable: true, align: 'left' },
    { key: 'image', label: 'IMAGE', sortable: false, align: 'left' },
    { key: 'productName', label: 'PRODUCT', sortable: true, align: 'left' },
    { key: 'quantity', label: 'QTY', sortable: true, align: 'left' },
    { key: 'price', label: 'PRICE', sortable: true, align: 'left' },
    { key: 'userName', label: 'USER NAME', sortable: true, align: 'left' },
    { key: 'mobileNo', label: 'MOBILE NO', sortable: true, align: 'left' },
    { key: 'returnStatus', label: 'RETURN STATUS', sortable: true, align: 'left' },
    { key: 'parcelReceived', label: 'PARCEL RECEIVED', sortable: true, align: 'left' },
    { key: 'refundStatus', label: 'REFUND STATUS', sortable: true, align: 'left' },
    { key: 'actions', label: 'ACTIONS', sortable: false, align: 'center' }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Return Requested':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Return Approved':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Return Rejected':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'Returned & Refunded':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const renderRequestRow = (request, index) => (
    <tr key={`${request.orderId}-${request.itemId}`} className="hover:bg-slate-50/40 transition-colors">
      <td className="py-4 px-4 font-semibold text-slate-700">{request.orderCode}</td>
      <td className="py-4 px-4">
        {request.image ? (
          <img 
            src={formatImageUrl(request.image)} 
            alt="Product" 
            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
          />
        ) : (
          <span className="text-gray-400 font-normal">No image</span>
        )}
      </td>
      <td className="py-4 px-4 text-slate-700 font-medium max-w-xs truncate" title={request.productName}>
        {request.productName}
      </td>
      <td className="py-4 px-4 text-slate-700 font-semibold">{request.quantity}</td>
      <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
        ₹{(request.price * request.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="py-4 px-4 text-slate-600 font-medium">{request.userName}</td>
      <td className="py-4 px-4 text-slate-600">{request.mobileNo}</td>
      <td className="py-4 px-4">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(request.returnStatus)}`}>
          {request.returnStatus}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${request.parcelReceived ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-50 text-slate-400'}`}>
          {request.parcelReceived ? 'YES' : 'NO'}
        </span>
      </td>
      <td className="py-4 px-4 font-semibold">
        <span className={`text-xs ${request.refundStatus === 'Refunded' ? 'text-emerald-600' : 'text-slate-500'}`}>
          {request.refundStatus || 'Pending'}
        </span>
      </td>
      <td className="py-4 px-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => { setSelectedRequest(request); setIsViewModalOpen(true); }}
            className="bg-primary hover:bg-[#002233] text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            title="View Details / Review Return"
          >
            <Eye size={12} />
            View
          </button>
          
          {request.returnStatus === 'Return Approved' && !request.parcelReceived && (
            <button
              type="button"
              onClick={() => handleReceiveParcel(request)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Receive Parcel
            </button>
          )}

          {request.returnStatus === 'Return Approved' && request.parcelReceived && request.refundStatus !== 'Refunded' && (
            <button
              type="button"
              onClick={() => handleRefundItem(request)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Refund
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full font-sans text-slate-700 antialiased">
      <ToastContainer />
      
      <PageHeader
        title="Return Requests (Buyer)"
        subtitle="Process returns, view uploaded item photos, approve/reject requests, and handle refunds."
      />

      <div className="max-w-[1600px] mx-auto space-y-6 mt-6">
        
        {/* UPPER SUMMARY HEADING METRICS BOARD */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="pb-4 md:pb-0 md:pr-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{totalRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Total Requests</span>
            </div>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-gray-100">
              <Package size={18} />
            </div>
          </div>

          <div className="py-4 md:py-0 md:px-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{pendingRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Pending Review</span>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100">
              <Clock size={18} />
            </div>
          </div>

          <div className="py-4 md:py-0 md:px-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{approvedRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Approved Returns</span>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100">
              <Check size={18} />
            </div>
          </div>

          <div className="py-4 md:py-0 md:pl-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{refundedRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Refunded & Closed</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100">
              <RefreshCw size={18} />
            </div>
          </div>
        </div>

        {/* CORE DATA INTERFACE PANEL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          
          <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Show entries:</span>
              <select 
                value={entriesCount} 
                onChange={(e) => setEntriesCount(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer focus:border-gray-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-medium text-slate-500">Search:</span>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  placeholder="Order ID, Product, or Customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition-all pl-8"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ADMIN TABLE IMPLEMENTATION */}
          <AdminTable
            headers={tableHeaders}
            data={sortedRequests.slice(0, entriesCount)}
            renderRow={renderRequestRow}
            onSort={handleSort}
            sortConfig={sortConfig}
            minWidth="min-w-[1300px]"
            containerClassName="border-none rounded-none shadow-none"
            emptyMessage={loading ? "Loading return requests from server..." : "No matching return requests found."}
          />
        </div>
      </div>

      {/* DETAILED RETURN REVIEW OVERLAY MODAL */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-8">
            
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-primary" />
                Return Request Details - #{selectedRequest.orderCode}
              </h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-medium text-slate-600 overflow-y-auto max-h-[70vh]">
              {/* Order and Customer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Customer Details</span>
                  <div className="text-slate-850 font-bold flex items-center gap-1">
                    <User size={12} className="text-slate-400" /> {selectedRequest.userName}
                  </div>
                  <div className="text-slate-600">{selectedRequest.mobileNo}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Shipping Address</span>
                  <p className="text-slate-600 leading-relaxed font-normal">{selectedRequest.address}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-gray-100 pb-1">Returned Item Details</h4>
                <div className="flex items-center gap-3 p-2 bg-slate-50/30 rounded-lg">
                  {selectedRequest.image ? (
                    <img 
                      src={formatImageUrl(selectedRequest.image)} 
                      alt="Product" 
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-150 rounded flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                  )}
                  <div>
                    <span className="font-bold text-slate-800 block">{selectedRequest.productName}</span>
                    <span className="text-slate-500 font-semibold">Qty: {selectedRequest.quantity} × ₹{selectedRequest.price.toFixed(2)}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] text-gray-400 block">Total Refund Value</span>
                    <span className="text-sm font-black text-slate-850">₹{(selectedRequest.price * selectedRequest.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Return Reason */}
              <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl space-y-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Customer Reason for Return</span>
                <p className="text-slate-700 font-bold italic leading-relaxed">"{selectedRequest.returnReason || 'No reason provided'}"</p>
              </div>

              {/* Uploaded Return Photo Proof */}
              {selectedRequest.returnPhoto ? (
                <div className="space-y-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Uploaded Photo Proof</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.returnPhoto.split(',').filter(Boolean).map((photoUrl, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50/50 flex items-center justify-center p-2 max-h-36 relative">
                        <a href={formatImageUrl(photoUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                          <img 
                            src={formatImageUrl(photoUrl)} 
                            alt={`Return Proof ${idx + 1}`} 
                            className="max-h-32 max-w-full object-contain rounded-lg shadow-sm border border-gray-150 hover:scale-105 transition-transform"
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/50 border border-amber-100/60 p-3.5 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-amber-800 text-[11px] leading-relaxed font-normal">
                    No photo proof was uploaded by the customer for this return request.
                  </span>
                </div>
              )}

              {/* Review Timeline Statuses */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-gray-400 block uppercase font-semibold text-[9px]">Return Status</span>
                  <span className="font-bold text-slate-800">{selectedRequest.returnStatus}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-gray-400 block uppercase font-semibold text-[9px]">Refund Status</span>
                  <span className="font-bold text-slate-800">{selectedRequest.refundStatus || 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
                disabled={actionLoading}
              >
                Close
              </button>

              {selectedRequest.returnStatus === 'Return Requested' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReviewReturn('reject')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                    disabled={actionLoading}
                  >
                    Reject Return
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewReturn('approve')}
                    className="bg-primary hover:bg-[#002233] text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                    disabled={actionLoading}
                  >
                    Approve Return
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />

    </div>
  );
};

export default ReturnRequests;
