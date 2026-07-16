import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { Search, X, ShieldAlert, Package, User, Clock, AlertTriangle, Ban, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable';
import { toast, ToastContainer } from '../../components/toast';
import { API_URL } from '../../api/api';
import {
  adminGetReturnRequestsAPI,
  adminReviewReturnAPI,
  adminReceiveParcelAPI,
  adminRefundItemAPI,
  adminGetCancellationRequestsAPI,  
  adminReviewCancellationAPI
} from '../../api/orderApi';
import ConfirmationModal from '../../components/ConfirmationModal';

const ReturnRequests = () => {
  const [activeTab, setActiveTab] = useState('returns');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
const [sortConfig, setSortConfig] = useState({ key: 'cancellationDate', direction: 'desc' });
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

  // Dynamically load data depending on selected view
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'returns' 
        ? await adminGetReturnRequestsAPI()
        : await adminGetCancellationRequestsAPI();

      if (res && res.success) {
        setRequests(res.data || []);
      } else {
        toast.error(res.message || `Failed to fetch ${activeTab} requests`);
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Server error fetching ${activeTab} requests`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  // --- SAFE & UNIFIED DATA PARSING LOGIC ---
  let structuralRequests = [];

  if (Array.isArray(requests) && requests.length > 0) {
    if (activeTab === 'returns') {
      requests.forEach(item => {
        if (item && item.returnStatus && item.returnStatus !== 'None') {
          structuralRequests.push({
            orderId: item.orderId,
            itemId: item.itemId,
            orderCode: item.orderCode,
            image: item.image,
            productName: item.productName || item.title,
            quantity: item.quantity,
            price: item.price,
            userName: item.userName || 'N/A',
            mobileNo: item.mobileNo || 'N/A',
            address: item.address || 'N/A',
            displayStatus: item.returnStatus,
            returnReason: item.returnReason,
            returnPhoto: item.returnPhoto,
            parcelReceived: item.parcelReceived,
            refundStatus: item.refundStatus
          });
        }
      });
   } else {
      // Process Cancellations Order Layout
      requests.forEach(order => {
        if (!order) return;
        
        // Match string combinations safely
        const orderStatus = order.status || '';
        if (
          orderStatus === 'Cancellation Requested' || 
          orderStatus === 'Cancelled' || 
          orderStatus === 'Cancellation Rejected'
        ) {
          // Robust ID Resolution: Check all possible formats ($oid object, plain string, object with toString)
          let resolvedOrderId = '';
          if (order._id) {
            if (typeof order._id === 'string') {
              resolvedOrderId = order._id;
            } else if (order._id.$oid) {
              resolvedOrderId = order._id.$oid;
            } else if (typeof order._id.toString === 'function') {
              resolvedOrderId = order._id.toString();
            }
          }

          order.items?.forEach(item => {
            if (!item) return;

            let resolvedItemId = '';
            if (item._id) {
              if (typeof item._id === 'string') {
                resolvedItemId = item._id;
              } else if (item._id.$oid) {
                resolvedItemId = item._id.$oid;
              } else if (typeof item._id.toString === 'function') {
                resolvedItemId = item._id.toString();
              }
            }

            structuralRequests.push({
              orderId: resolvedOrderId,
              itemId: resolvedItemId,
              orderCode: order.orderId || order.orderCode || 'N/A',
              image: item.image,
              productName: item.title || item.productName || 'Unknown Product',
              quantity: item.quantity || 1,
              price: item.price || 0,
              userName: order.shippingAddress?.fullName || 'N/A',
              mobileNo: order.shippingAddress?.phoneNumber || 'N/A',
              address: order.shippingAddress 
                ? `${order.shippingAddress.streetAddress || ''}, ${order.shippingAddress.apartment || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}`
                : 'N/A',
              displayStatus: orderStatus,
              cancellationReason: order.cancellationReason || 'No reason specified'
            });
          });
        }
      });
    }}

  // Summary Metrics Board Calculated Safely
  const totalRequests = structuralRequests.length;
  
  const pendingRequests = structuralRequests.filter(r => 
    r.displayStatus === 'Return Requested' || r.displayStatus === 'Cancellation Requested'
  ).length;

  const approvedRequests = structuralRequests.filter(r => 
    ['Return Approved', 'Returned & Refunded', 'Cancelled'].includes(r.displayStatus)
  ).length;

  // Safe Search Filter Logic to prevent undefined checks breaking the UI
  const filteredRequests = structuralRequests.filter(req => {
    const query = debouncedSearchQuery.toLowerCase();
    return (
      (req.orderCode && req.orderCode.toLowerCase().includes(query)) ||
      (req.productName && req.productName.toLowerCase().includes(query)) ||
      (req.userName && req.userName.toLowerCase().includes(query)) ||
      (req.mobileNo && req.mobileNo.includes(query))
    );
  });

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

 const handleReviewAction = async (action) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      let res;
      if (activeTab === 'returns') {
        res = await adminReviewReturnAPI(selectedRequest.orderId, selectedRequest.itemId, action);
      } else {
        // FIX: Pass the raw action string ('approve' or 'reject') directly!
        // Your orderApi.js definition will translate it to the correct status.
        res = await adminReviewCancellationAPI(selectedRequest.orderId, selectedRequest.itemId, action);
      }

      if (res && res.success) {
        toast.success(`${activeTab === 'returns' ? 'Return' : 'Cancellation'} request updated successfully.`);
        loadRequests();
        setIsViewModalOpen(false);
      } else {
        toast.error(res.message || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error processing action');
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
    { key: 'displayStatus', label: activeTab === 'returns' ? 'RETURN STATUS' : 'CANCELLATION STATUS', sortable: true, align: 'left' },
    ...(activeTab === 'returns' ? [
      { key: 'parcelReceived', label: 'PARCEL RECEIVED', sortable: true, align: 'left' },
      { key: 'refundStatus', label: 'REFUND STATUS', sortable: true, align: 'left' }
    ] : []),
    { key: 'actions', label: 'ACTIONS', sortable: false, align: 'center' }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Return Requested':
      case 'Cancellation Requested':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Return Approved':
      case 'Cancelled':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Return Rejected':
      case 'Cancellation Rejected':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'Returned & Refunded':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const renderRequestRow = (request) => (
    <tr key={`${request.orderId}-${request.itemId}`} className="hover:bg-slate-50/40 transition-colors">
      <td className="py-4 px-4 font-semibold text-slate-700">{request.orderCode}</td>
      <td className="py-4 px-4">
        {request.image ? (
          <img src={formatImageUrl(request.image)} alt="Product" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
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
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(request.displayStatus)}`}>
          {request.displayStatus}
        </span>
      </td>
      
      {activeTab === 'returns' && (
        <>
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
        </>
      )}

      <td className="py-4 px-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => { setSelectedRequest(request); setIsViewModalOpen(true); }}
            className="bg-primary hover:bg-[#002233] text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Eye size={12} /> View
          </button>
          
          {activeTab === 'returns' && request.displayStatus === 'Return Approved' && !request.parcelReceived && (
            <button
              type="button"
              onClick={() => handleReceiveParcel(request)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Receive Parcel
            </button>
          )}

          {activeTab === 'returns' && request.displayStatus === 'Return Approved' && request.parcelReceived && request.refundStatus !== 'Refunded' && (
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
      <PageHeader title="Order Claim Manager (Buyer Requests)" subtitle="Manage product returns, cancellations, status approval loops, and transactional client updates." />

      <div className="max-w-[1600px] mx-auto mt-6 flex border-b border-gray-200">
        <button onClick={() => setActiveTab('returns')} className={`px-5 py-2.5 font-bold text-xs transition-all uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'returns' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-slate-600'}`}>
          Return Requests
        </button>
        <button onClick={() => setActiveTab('cancellations')} className={`px-5 py-2.5 font-bold text-xs transition-all uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'cancellations' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-slate-600'}`}>
          Cancellation Requests
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="pb-4 md:pb-0 md:pr-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{totalRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Total {activeTab} Filed</span>
            </div>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-gray-100"><Package size={18} /></div>
          </div>
          <div className="py-4 md:py-0 md:px-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{pendingRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Pending Action</span>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100"><Clock size={18} /></div>
          </div>
          <div className="py-4 md:py-0 md:pl-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{approvedRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Processed / Closed</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100"><Ban size={18} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Show entries:</span>
              <select value={entriesCount} onChange={(e) => setEntriesCount(Number(e.target.value))} className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer focus:border-gray-300">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-medium text-slate-500">Search:</span>
              <div className="relative w-full sm:w-64">
                <input type="text" placeholder="Order ID, Product, or Customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 focus:border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition-all pl-8" />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
              </div>
            </div>
          </div>

          <AdminTable headers={tableHeaders} data={sortedRequests.slice(0, entriesCount)} renderRow={renderRequestRow} onSort={handleSort} sortConfig={sortConfig} minWidth="min-w-[1300px]" containerClassName="border-none rounded-none shadow-none" emptyMessage={loading ? "Fetching records from data server..." : "No matching requests found."} />
        </div>
      </div>

      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-8">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-primary" /> {activeTab === 'returns' ? 'Return' : 'Cancellation'} Request Details - #{selectedRequest.orderCode}
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5 text-xs font-medium text-slate-600 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Customer Details</span>
                  <div className="text-slate-850 font-bold flex items-center gap-1"><User size={12} className="text-slate-400" /> {selectedRequest.userName}</div>
                  <div className="text-slate-600">{selectedRequest.mobileNo}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Shipping Address</span>
                  <p className="text-slate-600 leading-relaxed font-normal">{selectedRequest.address}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-gray-100 pb-1">Item Details</h4>
                <div className="flex items-center gap-3 p-2 bg-slate-50/30 rounded-lg">
                  {selectedRequest.image ? <img src={formatImageUrl(selectedRequest.image)} alt="Product" className="w-12 h-12 object-cover rounded border border-gray-200" /> : <div className="w-12 h-12 bg-gray-150 rounded flex items-center justify-center text-[10px] text-gray-400">No Image</div>}
                  <div>
                    <span className="font-bold text-slate-800 block">{selectedRequest.productName}</span>
                    <span className="text-slate-500 font-semibold">Qty: {selectedRequest.quantity} × ₹{selectedRequest.price.toFixed(2)}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] text-gray-400 block">Total Transaction Value</span>
                    <span className="text-sm font-black text-slate-850">₹{(selectedRequest.price * selectedRequest.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl space-y-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">{activeTab === 'returns' ? 'Customer Reason for Return' : 'Customer Reason for Cancellation'}</span>
                <p className="text-slate-700 font-bold italic leading-relaxed">"{selectedRequest.returnReason || selectedRequest.cancellationReason || 'No reason provided'}"</p>
              </div>

              {activeTab === 'returns' && (
                selectedRequest.returnPhoto ? (
                  <div className="space-y-2">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Uploaded Photo Proof</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRequest.returnPhoto.split(',').filter(Boolean).map((photoUrl, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50/50 flex items-center justify-center p-2 max-h-36 relative">
                          <a href={formatImageUrl(photoUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                            <img src={formatImageUrl(photoUrl)} alt={`Return Proof ${idx + 1}`} className="max-h-32 max-w-full object-contain rounded-lg shadow-sm border border-gray-150 hover:scale-105 transition-transform" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100/60 p-3.5 rounded-xl flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-amber-800 text-[11px] leading-relaxed font-normal">No photo proof was uploaded by the customer for this return request.</span>
                  </div>
                )
              )}
            </div>

           <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-3">
  <button 
    type="button" 
    onClick={() => setIsViewModalOpen(false)} 
    className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-2xs cursor-pointer disabled:opacity-50" 
    disabled={actionLoading}
  >
    Close
  </button>
  
  {(selectedRequest.displayStatus === 'Return Requested' || selectedRequest.displayStatus === 'Cancellation Requested') && (
    <>
      <button 
        type="button" 
        onClick={() => handleReviewAction('approve')} 
        className="bg-primary hover:bg-[#002233] text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed" 
        disabled={actionLoading}
      >
        {actionLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Approve Request'
        )}
      </button>
    </>
  )}
</div>

          </div>
        </div>
      )}

      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDanger={confirmModal.isDanger} />
    </div>
  );
};

export default ReturnRequests;