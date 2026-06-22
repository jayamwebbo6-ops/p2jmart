import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  Download, 
  Eye, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';
import AdminTable from '../../components/AdminTable'; // Assuming AdminTable is in the same folder path
import PageHeader from '../../components/PageHeader';

const INITIAL_ORDERS = [
  {
    id: "ORD-2026-025",
    productName: "Pure Silver Kumkum Box",
    storeName: "Joy Gift House",
    customerName: "jayamweb.designer2",
    customerEmail: "jayamweb.designer2@gmail.com",
    customerPhone: "7826920882",
    shippingAddress: "dfghj, gh, Himachal Pradesh - 844884. PH: 7826920882",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    razorpayOrderId: "order_T3pzB0aDgGtvzs",
    razorpayPaymentId: "pay_T3pzJFBftnU9JF",
    amount: 1500.00,
    itemColor: "Color: Gold, Size: 5 inch",
    itemQuantity: 1,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "ORD-2026-010",
    productName: "Gift",
    storeName: "Joy Gift House",
    customerName: "joytraders29",
    customerEmail: "joytraders29@gmail.com",
    customerPhone: "9876543210",
    shippingAddress: "Plot 42, Innovation Street, Bangalore, Karnataka - 560001",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    razorpayOrderId: "order_M4xzB0aDgGtf5x",
    razorpayPaymentId: "pay_M4xzJFBftnU8KK",
    amount: 350.00,
    itemColor: "Standard Frame, Size: A4",
    itemQuantity: 1,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "ORD-2026-009",
    productName: "Perumal",
    storeName: "Joy Gift House",
    customerName: "Dilagar G",
    customerEmail: "dilagardilak@gmail.com",
    customerPhone: "9087654321",
    shippingAddress: "12/A, Temple Street, Chennai, Tamil Nadu - 600004",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "NetBanking",
    razorpayOrderId: "order_K9izB0aDgGtu2y",
    razorpayPaymentId: "pay_K9izJFBftnU3LL",
    amount: 1100.00,
    itemColor: "Gold Antique Finish, Size: Medium",
    itemQuantity: 1,
    image: "https://images.unsplash.com/photo-1608962714006-29907c0864f6?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "ORD-2026-008",
    productName: "Murugan",
    storeName: "Joy Gift House",
    customerName: "zubair",
    customerEmail: "jayamwebbo6@gmail.com",
    customerPhone: "8976543210",
    shippingAddress: "North High Block, Madurai, Tamil Nadu - 625001",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    razorpayOrderId: "order_A4pzB0aDgGtv9u",
    razorpayPaymentId: "pay_A4pzJFBftnU1MM",
    amount: 190.00,
    itemColor: "Default Plaque, Standard size",
    itemQuantity: 1,
    image: null
  },
  {
    id: "ORD-2026-007",
    productName: "Murugan",
    storeName: "Joy Gift House",
    customerName: "Zubair",
    customerEmail: "zubair86103@gmail.com",
    customerPhone: "8610399999",
    shippingAddress: "South Cross Gate, Trichy, Tamil Nadu - 620002",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    razorpayOrderId: "order_Z2pzB0aDgGtv3p",
    razorpayPaymentId: "pay_Z2pzJFBftnU2NN",
    amount: 190.00,
    itemColor: "Default Plaque, Standard size",
    itemQuantity: 1,
    image: null
  },
  {
    id: "ORD-2026-006",
    productName: "Murugan",
    storeName: "Joy Gift House",
    customerName: "zubair",
    customerEmail: "jayamwebbo6@gmail.com",
    customerPhone: "8976543210",
    shippingAddress: "North High Block, Madurai, Tamil Nadu - 625001",
    timestamp: "Jun 20, 2026",
    fulfillmentStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    razorpayOrderId: "order_Y1pzB0aDgGtv1a",
    razorpayPaymentId: "pay_Y1pzJFBftnU0PP",
    amount: 220.00,
    itemColor: "Default Plaque, Premium Gloss",
    itemQuantity: 1,
    image: null
  }
];

const OrderManagement = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [timeFilter, setTimeFilter] = useState('ALL TIME');
  
  // State specifically for common metric card headings timeline filter
  const [headingTimeframe, setHeadingTimeframe] = useState('ALL TIME');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  // 1. Table Config Declarations for <AdminTable />
  const tableHeaders = [
    { key: 'id', label: 'Order Identity', sortable: true, align: 'left' },
    { key: 'productName', label: 'Product', sortable: true, align: 'left' },
    { key: 'customerName', label: 'Info', sortable: true, align: 'left' },
    { key: 'timestamp', label: 'Timestamp', sortable: true, align: 'left' },
    { key: 'fulfillmentStatus', label: 'Fulfillment Status', sortable: true, align: 'left' },
    { key: 'paymentStatus', label: 'Payment Status', sortable: false, align: 'left' },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
    { key: 'actions', label: 'Action', sortable: false, align: 'center' }
  ];

  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('ALL STATUS');
    setTimeFilter('ALL TIME');
    setHeadingTimeframe('ALL TIME');
    setOrders(INITIAL_ORDERS);
  };

  // Excel Spreadsheet Native URI Downloader Pipeline
  const handleExportVault = () => {
    if (sortedOrders.length === 0) {
      alert("No matching order records found to export.");
      return;
    }

    const headers = ["Order ID", "Product Name", "Store", "Customer Name", "Email", "Phone", "Timestamp", "Fulfillment Status", "Payment Status", "Amount (INR)"];
    
    const rows = sortedOrders.map(order => [
      `"${order.id}"`,
      `"${order.productName.replace(/"/g, '""')}"`,
      `"${order.storeName.replace(/"/g, '""')}"`,
      `"${order.customerName.replace(/"/g, '""')}"`,
      `"${order.customerEmail}"`,
      `"${order.customerPhone}"`,
      `"${order.timestamp}"`,
      `"${order.fulfillmentStatus}"`,
      `"${order.paymentStatus}"`,
      order.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `Order_Records_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleFulfillmentChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, fulfillmentStatus: newStatus } : order
    ));
  };

  // 3. Sorting & Filtering Handlers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper date checker logic to process metrics filter bounds
  const checkTimeScope = (orderTimestamp, filterValue) => {
    if (filterValue === 'ALL TIME') return true;
    
    const orderDate = new Date(orderTimestamp);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (filterValue === 'TODAY') {
      return orderDate >= startOfToday;
    }
    if (filterValue === 'WEEK') {
      const oneWeekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= oneWeekAgo;
    }
    if (filterValue === 'MONTH') {
      const oneMonthAgo = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, startOfToday.getDate());
      return orderDate >= oneMonthAgo;
    }
    if (filterValue === 'YEAR') {
      const currentYearStart = new Date(today.getFullYear(), 0, 1);
      return orderDate >= currentYearStart;
    }
    return true;
  };

  // Main table list data remains decoupled from headingTimeframe
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL STATUS' || 
      order.fulfillmentStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
  });

  // Numeric KPI Statistics calculated purely against headingTimeframe filter choice
  const headingFilteredOrders = orders.filter(o => checkTimeScope(o.timestamp, headingTimeframe));

  const totalOrdersCount = headingFilteredOrders.length; 
  
  const totalRevenueSum = headingFilteredOrders
    .reduce((sum, o) => sum + (o.amount * (o.itemQuantity || 1)), 0)
    .toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
  const pendingOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Processing' || o.fulfillmentStatus === 'Pending').length;
  const deliveredOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Delivered').length;
  const cancelledOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Cancelled').length; 
  const returnedOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Returned').length;

  // 4. Custom Rows Render callback passed down to your <AdminTable /> standard element
  const renderOrderRow = (order, index) => (
    <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
      
      {/* Identity Code */}
      <td className="py-4 px-4 font-bold text-red-600 select-all">
        {order.id}
      </td>
      
      {/* Product Image + Label info */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {order.image ? (
            <img 
              src={order.image} 
              alt={order.productName} 
              className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
              N/A
            </div>
          )}
          <div className="max-w-[160px]">
            <div className="font-bold text-slate-800 truncate">{order.productName}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{order.storeName}</div>
          </div>
        </div>
      </td>
      
      {/* Customer Contact metadata info column */}
      <td className="py-4 px-4">
        <div className="max-w-[180px]">
          <div className="font-bold text-slate-900 truncate">{order.customerName}</div>
          <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{order.customerEmail}</div>
        </div>
      </td>
      
      {/* Creation Timestamp */}
      <td className="py-4 px-4 text-slate-500 font-normal whitespace-nowrap">
        {order.timestamp}
      </td>
      
      {/* Fulfillment Pill design component */}
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          order.fulfillmentStatus === 'Delivered' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : order.fulfillmentStatus === 'Cancelled'
            ? 'bg-red-50 text-red-600 border border-red-100'
            : order.fulfillmentStatus === 'Returned'
            ? 'bg-purple-50 text-purple-600 border border-purple-100'
            : 'bg-amber-50 text-amber-600 border border-amber-100'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${order.fulfillmentStatus === 'Delivered' ? 'bg-emerald-500' : order.fulfillmentStatus === 'Cancelled' ? 'bg-red-500' : order.fulfillmentStatus === 'Returned' ? 'bg-purple-500' : 'bg-amber-500'}`} />
          {order.fulfillmentStatus}
        </span>
      </td>
      
      {/* Payment Gateway state display badge */}
      <td className="py-4 px-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100">
          <CheckCircle2 size={11} className="text-emerald-600" />
          {order.paymentStatus}
        </span>
      </td>
      
      {/* Financial aggregate cell element */}
      <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
        ₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      
      {/* Actions and Status Select Modifier pipeline container */}
      <td className="py-4 px-4">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
            className="text-pink-500 hover:text-pink-700 transition-colors cursor-pointer p-1"
            title="View Details Profile"
          >
            <Eye size={16} strokeWidth={2.5} className="text-pink-500" />
          </button>
          
          <div className="relative">
            <select
              value={order.fulfillmentStatus}
              onChange={(e) => handleFulfillmentChange(order.id, e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-lg appearance-none focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </td>

    </tr>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full font-sans text-slate-700 antialiased">
       <PageHeader
        title="orders management"
        subtitle="Manage All Orders Placed by customers with detailed insights and real timee"
      >
      </PageHeader>

      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* COMMON HEADING TIMEFRAME DROPDOWN CONTAINER */}
        <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-black tracking-wider text-slate-400 uppercase">Headings Metric Analytics Range</span>
          <div className="relative w-44">
            <select
              value={headingTimeframe}
              onChange={(e) => setHeadingTimeframe(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-slate-400 transition-all cursor-pointer shadow-xs"
            >
              <option value="ALL TIME">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="YEAR">This Year</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* METRICS WIDGET SUMMARY GRIDS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center border border-blue-100/50">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-blue-500 uppercase block">Total Orders</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{totalOrdersCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#002B49] flex items-center justify-center border border-slate-100/10">
              <IndianRupee size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase block">Total Revenue</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">₹{totalRevenueSum}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center border border-amber-100/50">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase block">Pending Orders</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{pendingOrdersCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center border border-emerald-100/50">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-emerald-500 uppercase block">Delivered</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{deliveredOrdersCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center border border-red-100/50">
              <XCircle size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-red-500 uppercase block">Cancelled</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{cancelledOrdersCount}</span>
            </div>
          </div>

          {/* NEW RETURNED ORDERS METRIC CARD */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center border border-purple-100/50">
              <RotateCw size={18} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-purple-500 uppercase block">Returned</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{returnedOrdersCount}</span>
            </div>
          </div>
        </div>

        {/* INPUT LOOKUP SEARCH ENGINE FILTERS */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Identity or Order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
            <div className="relative w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-slate-400 transition-all cursor-pointer shadow-xs"
              >
                <option value="ALL STATUS">All Status</option>
                <option value="PROCESSING">Processing</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RETURNED">Returned</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-44">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-slate-400 transition-all cursor-pointer shadow-xs"
              >
                <option value="ALL TIME">All Time</option>
                <option value="TODAY">Today</option>
                <option value="2026">Year 2026</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* CORE DATA RECORDS INTERFACE INTEGRATING YOUR SHARED <AdminTable /> */}
        <AdminTable
          headers={tableHeaders}
          data={sortedOrders}
          renderRow={renderOrderRow}
          onSort={handleSort}
          sortConfig={sortConfig}
          minWidth="min-w-[1160px]"
          containerClassName="touch-pan-x overscroll-x-contain shadow-xs border-slate-200/60"
          className="text-slate-700 font-medium"
          emptyMessage="No matching customer orders found in current search timeline parameters."
        />

        {/* TABLE FOOTER INTEGRATED PAGINATION MODULE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">
            Showing <span className="font-bold text-slate-700">1</span> to <span className="font-bold text-slate-700">{sortedOrders.length}</span> of <span className="font-bold text-slate-700">{orders.length}</span> orders
          </span>
          
          <div className="flex items-center gap-1.5">
            <button type="button" className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-4400 bg-slate-50 cursor-not-allowed" disabled>
              Previous
            </button>
            <button type="button" className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#002B49] text-white hover:bg-slate-800 transition-colors">
              1
            </button>
            <button type="button" className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              2
            </button>
            <button type="button" className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              Next
            </button>
          </div>
        </div>

      </div>

      {/* OVERLAY COMPLETE DETAILED MODAL POPUP VIEW */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Order Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                type="button" 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-black text-[#002B49] tracking-wide select-all">{selectedOrder.id}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Placed on {selectedOrder.timestamp}</div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-black uppercase tracking-wider ${
                    selectedOrder.fulfillmentStatus === 'Returned'
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <Clock size={12} strokeWidth={2.5} className={selectedOrder.fulfillmentStatus === 'Returned' ? 'text-purple-700' : 'text-amber-700'} />
                    {selectedOrder.fulfillmentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-800">Customer Information</h3>
                  <div className="space-y-1 font-medium text-slate-600">
                    <div className="flex gap-1"><span className="text-slate-400 font-normal">Name:</span> <span className="text-slate-900 font-bold">{selectedOrder.customerName}</span></div>
                    <div className="flex gap-1 truncate"><span className="text-slate-400 font-normal">Email:</span> <span className="text-slate-800">{selectedOrder.customerEmail}</span></div>
                    <div className="flex gap-1"><span className="text-slate-400 font-normal">Phone:</span> <span className="text-slate-800">{selectedOrder.customerPhone}</span></div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-800">Shipping Address</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{selectedOrder.shippingAddress}</p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                  <div className="space-y-2 font-medium text-slate-600">
                    <div className="flex gap-1"><span className="text-slate-400 font-normal">Method:</span> <span className="text-slate-900 font-black">{selectedOrder.paymentMethod}</span></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-normal">Status:</span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold border border-emerald-100">
                        <CheckCircle2 size={10} strokeWidth={3} className="text-emerald-600" />
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Razorpay Order ID</div>
                        <div className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md mt-0.5 font-mono truncate text-[10px] select-all">
                          {selectedOrder.razorpayOrderId}
                        </div>
                      </div>
                      <div className="pt-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Razorpay Payment ID</div>
                        <div className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md mt-0.5 font-mono truncate text-[10px] select-all">
                          {selectedOrder.razorpayPaymentId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100">
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Color</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr>
                        <td className="py-3 px-4">
                          {selectedOrder.image ? (
                            <img src={selectedOrder.image} alt={selectedOrder.productName} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 font-bold text-[9px] flex items-center justify-center">N/A</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-red-600 font-bold max-w-[180px] truncate">{selectedOrder.productName}</td>
                        <td className="py-3 px-4 text-slate-500 font-normal">{selectedOrder.itemColor}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">{selectedOrder.itemQuantity}</td>
                        <td className="py-3 px-4 text-right">₹{selectedOrder.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">₹{(selectedOrder.amount * selectedOrder.itemQuantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900 text-sm">₹{(selectedOrder.amount * selectedOrder.itemQuantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;