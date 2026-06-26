import React, { useState } from 'react';
import { Search, ChevronDown, X, Trash2, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AdminTable from '../../components/AdminTable'; // Imported your standard component
import { toast, ToastContainer } from '../../components/toast';

const INITIAL_REQUESTS = [
  {
    slNo: 1,
    id: "993",
    image: null,
    orderedTime: "1/12/2026, 2:17:16 PM",
    productName: "N/A",
    quantity: 1,
    price: 0.00,
    userName: "admin1",
    mobileNo: "8306542671",
    address: "Latha Apartments2 , Tambaram, Chennai, Chennai, Tamilnadu - 600086",
    status: "Cancelled",
    cancelledReason: "Cancelled by admin"
  },
  {
    slNo: 2,
    id: "992",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60",
    orderedTime: "5/15/2025, 11:24:54 AM",
    productName: "N/A",
    quantity: 1,
    price: 1799.00,
    userName: "jayamweb",
    mobileNo: "9677876445",
    address: "no,1, first street, bhatahi nagar, old perungalathur, chennai, Tamil Nadu - 600063",
    status: "Cancelled",
    cancelledReason: "order cancelled by admin"
  },
  {
    slNo: 3,
    id: "991",
    image: null,
    orderedTime: "6/22/2026, 10:15:00 AM",
    productName: "Premium Gift Box",
    quantity: 2,
    price: 1250.00,
    userName: "kalai_anbu",
    mobileNo: "9840123456",
    address: "Block B, Green Valley Apartments, Adyar, Chennai - 600020",
    status: "Pending Request",
    cancelledReason: ""
  }
];

const CancelRequests = () => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  
  // Interactive Dialog Modal Triggers
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [confirmCancelTarget, setConfirmCancelTarget] = useState(null);

  // Structural Heading Metrics Pipeline Calculated Live
  const totalRequests = requests.length;
  const acceptedRequests = requests.filter(r => r.status === 'Cancelled').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  // Search Engine Data Filter Logic
  const filteredRequests = requests.filter(req => 
    req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mobileNo.includes(searchQuery)
  );

  // Sorting Handler for AdminTable
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
    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  // Execution pipeline handler to confirm cancellations
  const handleConfirmCancelOrder = () => {
    if (!confirmCancelTarget) return;

    setRequests(prev => prev.map(req => {
      if (req.id === confirmCancelTarget.id) {
        return {
          ...req,
          status: "Cancelled",
          cancelledReason: "Cancelled by admin manually"
        };
      }
      return req;
    }));

    toast.success(`Order ID #${confirmCancelTarget.id} was successfully cancelled.`);
    setConfirmCancelTarget(null);
  };

  // 1. Defining headers matching AdminTable spec
  const tableHeaders = [
    { key: 'slNo', label: 'SL NO', sortable: true, align: 'left' },
    { key: 'image', label: 'IMAGE', sortable: false, align: 'left' },
    { key: 'id', label: 'ORDER ID', sortable: true, align: 'left' },
    { key: 'orderedTime', label: 'ORDERED TIME', sortable: true, align: 'left' },
    { key: 'productName', label: 'PRODUCT', sortable: true, align: 'left' },
    { key: 'quantity', label: 'QTY', sortable: true, align: 'left' },
    { key: 'price', label: 'PRICE', sortable: true, align: 'left' },
    { key: 'userName', label: 'USER NAME', sortable: true, align: 'left' },
    { key: 'mobileNo', label: 'MOBILE NO', sortable: true, align: 'left' },
    { key: 'address', label: 'ADDRESS', sortable: false, align: 'left' },
    { key: 'cancelledReason', label: 'CANCELLED REASON', sortable: false, align: 'left' },
    { key: 'actions', label: 'ACTIONS', sortable: false, align: 'center' }
  ];

  // 2. Custom Row Renderer callback passed down to <AdminTable />
  const renderRequestRow = (request, index) => (
    <tr key={request.id} className="hover:bg-slate-50/40 transition-colors">
      <td className="py-4 px-4 text-slate-400">{request.slNo}</td>
      <td className="py-4 px-4">
        {request.image ? (
          <img 
            src={request.image} 
            alt="Product" 
            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
          />
        ) : (
          <span className="text-gray-400 font-normal">No image</span>
        )}
      </td>
      <td className="py-4 px-4 font-semibold text-slate-700">{request.id}</td>
      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{request.orderedTime}</td>
      <td className="py-4 px-4 text-slate-400">{request.productName}</td>
      <td className="py-4 px-4 text-slate-700 font-semibold">{request.quantity}</td>
      <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
        ₹{request.price.toFixed(2)}
      </td>
      <td className="py-4 px-4 text-slate-600">{request.userName}</td>
      <td className="py-4 px-4 text-slate-600">{request.mobileNo}</td>
      <td className="py-4 px-4 text-slate-500 leading-relaxed max-w-xs">{request.address}</td>
      <td className="py-4 px-4 text-slate-500 italic">
        {request.cancelledReason || <span className="text-gray-300 not-italic">—</span>}
      </td>
      
      <td className="py-4 px-4 text-center whitespace-nowrap">
        {request.status === 'Cancelled' ? (
          <button
            type="button"
            onClick={() => { setSelectedRequest(request); setIsViewModalOpen(true); }}
            className="bg-[#009EDB] hover:bg-[#0081B4] text-white font-semibold px-4 py-1.5 rounded text-xs transition-colors shadow-2xs cursor-pointer"
          >
            View
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmCancelTarget(request)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors shadow-2xs flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <Trash2 size={12} />
            Cancel Order
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <div className="w-full font-sans text-slate-700 antialiased">
      <ToastContainer />
      
      <PageHeader
        title="Cancel Requests (Buyer)"
        subtitle="Review, approve, or reject order cancellation requests submitted by customers."
      />

      <div className="max-w-[1600px] mx-auto space-y-6 mt-6">
        
        {/* UPPER SUMMARY HEADING METRICS BOARD */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="pb-4 md:pb-0 md:pr-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{totalRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Total Request</span>
            </div>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>

          <div className="py-4 md:py-0 md:px-6 flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight block">{acceptedRequests}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Accepted</span>
            </div>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>

         <div className="py-4 md:py-0 md:px-6 flex items-center justify-between">
  <div>
    <span className="text-3xl font-bold text-slate-800 tracking-tight block">{rejectedRequests}</span>
    <span className="text-xs font-semibold text-gray-400 uppercase mt-1 block">Rejected</span>
  </div>
  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-gray-100">
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
</div>
          
          <div className="pt-4 md:pt-0 md:pl-6 hidden md:block bg-transparent" />
        </div>

        {/* CORE DATA INTERFACE PANEL WRAPPING THE ADMIN TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          
         

          {/* TABLE QUERY CONTROL ACTION TOOLBAR */}
          <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-medium text-slate-500">Search:</span>
              <div className="relative w-full sm:w-52">
                <input 
                  type="text"
                  placeholder="search cancellation requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ADMIN TABLE IMPLEMENTATION PIPELINE */}
          <AdminTable
            headers={tableHeaders}
            data={sortedRequests.slice(0, entriesCount)}
            renderRow={renderRequestRow}
            onSort={handleSort}
            sortConfig={sortConfig}
            minWidth="min-w-[1300px]"
            containerClassName="border-none rounded-none shadow-none"
            emptyMessage="No matching records found in cancellation request queues."
          />
        </div>
      </div>

      {/* CONFIRMATION OVERLAY DIALOG MODAL */}
      {confirmCancelTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Confirm Cancellation</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Are you sure you want to cancel Order <strong>#{confirmCancelTarget.id}</strong>? This process action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelTarget(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PRODUCT POPUP METADATA OVERLAY MODAL */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-800">Order Profile Pipeline Details</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-medium text-slate-600 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Order ID</span>
                  <span className="text-slate-800 font-bold text-sm">#{selectedRequest.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Ordered Timestamp</span>
                  <span className="text-slate-700">{selectedRequest.orderedTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-gray-100 pb-1">Customer Profile & Address</h4>
                <div className="space-y-1">
                  <div>Buyer Identity: <span className="text-slate-900 font-bold">{selectedRequest.userName}</span></div>
                  <div>Mobile Contact: <span className="text-slate-800">{selectedRequest.mobileNo}</span></div>
                  <div className="mt-1 leading-relaxed text-slate-500 bg-gray-50 p-2 rounded-lg border border-gray-100/50">{selectedRequest.address}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-gray-100 pb-1">Financial Settlement Records</h4>
                
                <div className="flex items-center justify-between py-1 bg-slate-50/50 px-2 rounded">
                  <span>Quantity Units Requested:</span>
                  <span className="text-slate-900 font-bold">{selectedRequest.quantity}</span>
                </div>
                <div className="flex items-center justify-between py-1 bg-slate-50/50 px-2 rounded">
                  <span>Settlement Valuation:</span>
                  <span className="text-emerald-600 font-bold">₹{selectedRequest.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-red-50/60 border border-red-100/70 p-3.5 rounded-xl space-y-1">
                <span className="text-red-500 block text-[10px] uppercase font-black tracking-wider">Cancellation Resolution Log</span>
                <p className="text-slate-700 font-semibold italic">"{selectedRequest.cancelledReason}"</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CancelRequests;