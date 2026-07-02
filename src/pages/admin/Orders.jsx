import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
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
  X,
  Copy,
  Check
} from 'lucide-react';
import AdminTable from '../../components/AdminTable'; 
import PageHeader from '../../components/PageHeader';
import { ViewBtn } from '../../components/AdminButtons';
import { 
  adminGetAllOrdersAPI, 
  adminUpdateOrderStatusAPI,
  adminReviewReturnAPI,
  adminReceiveParcelAPI,
  adminRefundItemAPI
} from '../../api/orderApi';
import { toast } from '../../components/toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const formatImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  return `${BACKEND_URL}/${path.replace(/^\//, '')}`;
};

const getDisplayStatus = (order) => {
  if (!order) return '';
  const hasRefunded = order.items?.some(item => item.returnStatus === 'Returned & Refunded');
  if (hasRefunded) return 'Refunded';
  return order.fulfillmentStatus || order.status || 'Pending';
};


const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [timeFilter, setTimeFilter] = useState('ALL TIME');
  const [productTypeFilter, setProductTypeFilter] = useState('all'); // 'all', 'custom', 'combo'
  const [headingTimeframe, setHeadingTimeframe] = useState('ALL TIME');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Tracking modal states
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingLink, setTrackingLink] = useState('');

  const handleReviewReturn = async (orderId, itemId, action) => {
    try {
      const res = await adminReviewReturnAPI(orderId, itemId, action);
      if (res.success) {
        toast.success(`Return request ${action}ed successfully`);
        const updatedRaw = res.data;
        const mappedOrder = {
          ...updatedRaw,
          id: updatedRaw.orderId,
          _id: updatedRaw._id,
          productName: updatedRaw.items?.[0]
            ? `${updatedRaw.items[0].title}${updatedRaw.items.length > 1 ? ` (+${updatedRaw.items.length - 1} more)` : ''}`
            : 'No Items',
          productType: updatedRaw.items?.some(item => item.isComboProduct)
            ? 'combo'
            : (updatedRaw.items?.some(item => item.selectedOptions?.customization || item.selectedOptions?.customImage || item.selectedOptions?.customText) ? 'custom' : 'all'),
          image: updatedRaw.items?.[0]?.image || '',
          storeName: 'Joy Gift House',
          customerName: updatedRaw.user?.name || 'Guest User',
          customerEmail: updatedRaw.user?.email || 'N/A',
          customerPhone: updatedRaw.user?.phone || 'N/A',
          shippingAddress: updatedRaw.shippingAddress || 'N/A',
          timestamp: new Date(updatedRaw.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(updatedRaw.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          rawDate: new Date(updatedRaw.createdAt),
          fulfillmentStatus: updatedRaw.status,
          paymentStatus: updatedRaw.paymentStatus,
          paymentMethod: updatedRaw.paymentMethod,
          amount: updatedRaw.total,
          items: updatedRaw.items
        };

        setOrders(prev => prev.map(o => o._id === orderId ? mappedOrder : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(mappedOrder);
        }
      } else {
        toast.error(res.message || 'Failed to review return request');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error reviewing return');
    }
  };

  const handleReceiveParcel = async (orderId, itemId) => {
    try {
      const res = await adminReceiveParcelAPI(orderId, itemId);
      if (res.success) {
        toast.success('Parcel marked as received');
        const updatedRaw = res.data;
        const mappedOrder = {
          ...updatedRaw,
          id: updatedRaw.orderId,
          _id: updatedRaw._id,
          productName: updatedRaw.items?.[0]
            ? `${updatedRaw.items[0].title}${updatedRaw.items.length > 1 ? ` (+${updatedRaw.items.length - 1} more)` : ''}`
            : 'No Items',
          productType: updatedRaw.items?.some(item => item.isComboProduct)
            ? 'combo'
            : (updatedRaw.items?.some(item => item.selectedOptions?.customization || item.selectedOptions?.customImage || item.selectedOptions?.customText) ? 'custom' : 'all'),
          image: updatedRaw.items?.[0]?.image || '',
          storeName: 'Joy Gift House',
          customerName: updatedRaw.user?.name || 'Guest User',
          customerEmail: updatedRaw.user?.email || 'N/A',
          customerPhone: updatedRaw.user?.phone || 'N/A',
          shippingAddress: updatedRaw.shippingAddress || 'N/A',
          timestamp: new Date(updatedRaw.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(updatedRaw.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          rawDate: new Date(updatedRaw.createdAt),
          fulfillmentStatus: updatedRaw.status,
          paymentStatus: updatedRaw.paymentStatus,
          paymentMethod: updatedRaw.paymentMethod,
          amount: updatedRaw.total,
          items: updatedRaw.items
        };

        setOrders(prev => prev.map(o => o._id === orderId ? mappedOrder : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(mappedOrder);
        }
      } else {
        toast.error(res.message || 'Failed to mark parcel as received');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error marking parcel received');
    }
  };

  const handleRefundItem = async (orderId, itemId) => {
    try {
      const res = await adminRefundItemAPI(orderId, itemId);
      if (res.success) {
        toast.success('Refund processed and stock updated successfully');
        const updatedRaw = res.data;
        const mappedOrder = {
          ...updatedRaw,
          id: updatedRaw.orderId,
          _id: updatedRaw._id,
          productName: updatedRaw.items?.[0]
            ? `${updatedRaw.items[0].title}${updatedRaw.items.length > 1 ? ` (+${updatedRaw.items.length - 1} more)` : ''}`
            : 'No Items',
          productType: updatedRaw.items?.some(item => item.isComboProduct)
            ? 'combo'
            : (updatedRaw.items?.some(item => item.selectedOptions?.customization || item.selectedOptions?.customImage || item.selectedOptions?.customText) ? 'custom' : 'all'),
          image: updatedRaw.items?.[0]?.image || '',
          storeName: 'Joy Gift House',
          customerName: updatedRaw.user?.name || 'Guest User',
          customerEmail: updatedRaw.user?.email || 'N/A',
          customerPhone: updatedRaw.user?.phone || 'N/A',
          shippingAddress: updatedRaw.shippingAddress || 'N/A',
          timestamp: new Date(updatedRaw.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(updatedRaw.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          rawDate: new Date(updatedRaw.createdAt),
          fulfillmentStatus: updatedRaw.status,
          paymentStatus: updatedRaw.paymentStatus,
          paymentMethod: updatedRaw.paymentMethod,
          amount: updatedRaw.total,
          items: updatedRaw.items
        };

        setOrders(prev => prev.map(o => o._id === orderId ? mappedOrder : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(mappedOrder);
        }
      } else {
        toast.error(res.message || 'Failed to issue refund');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error issuing refund');
    }
  };

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case 'Return Requested':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">Return Requested</span>;
      case 'Return Approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Return Approved</span>;
      case 'Return Rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100">Return Rejected</span>;
      case 'Returned & Refunded':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Returned & Refunded</span>;
      default:
        return null;
    }
  };

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminGetAllOrdersAPI();
      if (res && res.success) {
        // Map database order entities to match component expectation
        const mapped = res.data.map(order => {
          const firstCustomItem = order.items?.find(item => 
            item.selectedOptions?.customization || 
            item.selectedOptions?.customImage || 
            item.selectedOptions?.customText
          );
          const customSpec = firstCustomItem?.selectedOptions?.customization || {
            text: firstCustomItem?.selectedOptions?.customText,
            image: firstCustomItem?.selectedOptions?.customImage
          };

          return {
            ...order,
            id: order.orderId,
            _id: order._id,
            productName: order.items?.[0] 
              ? `${order.items[0].title}${order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ''}`
              : 'No Items',
            productType: order.items?.some(item => item.isComboProduct) 
              ? 'combo' 
              : (firstCustomItem ? 'custom' : 'all'),
            customText: customSpec?.text || '',
            customImage: customSpec?.image || '',
            image: order.items?.[0]?.image || '',
            storeName: 'Joy Gift House',
            customerName: order.user?.name || 'Guest User',
            customerEmail: order.user?.email || 'N/A',
            customerPhone: order.user?.phone || 'N/A',
            shippingAddress: order.shippingAddress 
              ? `${order.shippingAddress.fullName}, ${order.shippingAddress.streetAddress}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}. PH: ${order.shippingAddress.phoneNumber}`
              : 'No Address',
            timestamp: new Date(order.placedDate || order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            rawDate: new Date(order.placedDate || order.createdAt),
            fulfillmentStatus: order.status,
            paymentStatus: order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1),
            paymentMethod: order.paymentMethod || 'Card',
            razorpayOrderId: order.orderId,
            razorpayPaymentId: 'pay_simulated_' + order._id.slice(-6),
            amount: order.total,
            trackingId: order.trackingId || '',
            trackingLink: order.trackingLink || '',
            itemColor: order.items?.[0]?.selectedOptions
              ? Object.entries(order.items[0].selectedOptions).filter(([k]) => k !== 'customization' && k !== 'customImage' && k !== 'customText').map(([k, v]) => `${k}: ${v}`).join(', ')
              : 'Standard',
            itemQuantity: order.items?.[0]?.quantity || 1
          };
        });
        setOrders(mapped);
      } else {
        toast.error(res?.message || 'Failed to fetch admin orders');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error fetching admin orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, timeFilter, productTypeFilter]);

  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('ALL STATUS');
    setTimeFilter('ALL TIME');
    setProductTypeFilter('all');
    setHeadingTimeframe('ALL TIME');
    fetchOrders();
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadAsset = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'custom-order-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFulfillmentChange = async (orderId, newStatus) => {
    if (newStatus === 'Shipped') {
      setTrackingOrderId(orderId);
      setTrackingId('');
      setTrackingLink('');
      setIsTrackingModalOpen(true);
      return;
    }

    try {
      const res = await adminUpdateOrderStatusAPI(orderId, newStatus);
      if (res && res.success) {
        toast.success(res.message || 'Order status updated successfully');
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, fulfillmentStatus: newStatus } 
            : order
        ));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus, fulfillmentStatus: newStatus }));
        }
      } else {
        toast.error(res?.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error updating status');
    }
  };

  const submitTrackingAndShip = async () => {
    if (!trackingId.trim() || !trackingLink.trim()) {
      toast.error('Both Tracking ID and Tracking Link are required to ship the order');
      return;
    }
    try {
      const res = await adminUpdateOrderStatusAPI(trackingOrderId, 'Shipped', {
        trackingId: trackingId.trim(),
        trackingLink: trackingLink.trim()
      });
      if (res && res.success) {
        toast.success(res.message || 'Order marked as Shipped successfully');
        setOrders(prev => prev.map(order => 
          order._id === trackingOrderId 
            ? { 
                ...order, 
                status: 'Shipped', 
                fulfillmentStatus: 'Shipped',
                trackingId: trackingId.trim(),
                trackingLink: trackingLink.trim()
              } 
            : order
        ));
        if (selectedOrder && selectedOrder._id === trackingOrderId) {
          setSelectedOrder(prev => ({ 
            ...prev, 
            status: 'Shipped', 
            fulfillmentStatus: 'Shipped',
            trackingId: trackingId.trim(),
            trackingLink: trackingLink.trim()
          }));
        }
        setIsTrackingModalOpen(false);
      } else {
        toast.error(res?.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error updating status');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const checkTimeScope = (orderTimestamp, filterValue) => {
    if (filterValue === 'ALL TIME') return true;
    const orderDate = new Date(orderTimestamp);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (filterValue === 'TODAY') return orderDate >= startOfToday;
    if (filterValue === 'WEEK') return orderDate >= new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (filterValue === 'MONTH') return orderDate >= new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, startOfToday.getDate());
    if (filterValue === 'YEAR') return orderDate >= new Date(today.getFullYear(), 0, 1);
    return true;
  };

  // Main interactive state filters combining tabular logic + product type selectors
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL STATUS' || 
      order.fulfillmentStatus.toUpperCase() === statusFilter.toUpperCase();

    let matchesProductType = true;
    if (productTypeFilter !== 'all') {
      matchesProductType = order.productType === productTypeFilter;
    }

    return matchesSearch && matchesStatus && matchesProductType;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === 'timestamp') {
      valA = a.rawDate || new Date(a.timestamp);
      valB = b.rawDate || new Date(b.timestamp);
    }
    if (valA instanceof Date && valB instanceof Date) {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string') {
      return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const headingFilteredOrders = orders.filter(o => checkTimeScope(o.timestamp, headingTimeframe));
  const totalOrdersCount = headingFilteredOrders.length; 
  
  const totalRevenueSum = headingFilteredOrders
    .reduce((sum, o) => sum + (o.amount), 0)
    .toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
  const pendingOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Processing' || o.fulfillmentStatus === 'Pending').length;
  const deliveredOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Delivered').length;
  const cancelledOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Cancelled').length; 
  const returnedOrdersCount = headingFilteredOrders.filter(o => o.fulfillmentStatus === 'Returned').length;

  // FIXED: Properly returning the row elements from this arrow function assignment variable
  const renderOrderRow = (order, index) => (
    <tr key={order._id || order.id} className="hover:bg-slate-50/40 transition-colors group text-xs font-semibold text-slate-700">
      <td className="py-3 px-2.5 font-bold text-blue-600 select-all">{order.id}</td>
      <td className="py-3 px-2.5">
        <div className="flex items-center gap-3">
          {order.items && order.items.length > 1 ? (
            <div className="flex -space-x-3 hover:-space-x-1.5 transition-all duration-300">
              {order.items.slice(0, 3).map((item, idx) => (
                item.image ? (
                  <img
                    key={idx}
                    src={formatImageUrl(item.image)}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded-lg ring-2 ring-white border border-slate-100 flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div key={idx} className="w-10 h-10 bg-slate-100 border border-slate-200 ring-2 ring-white rounded-lg text-slate-400 font-bold text-[8px] flex items-center justify-center flex-shrink-0 shadow-sm">N/A</div>
                )
              ))}
              {order.items.length > 3 && (
                <div className="w-10 h-10 bg-slate-800 ring-2 ring-white text-white font-extrabold text-[9px] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
          ) : (
            order.image ? (
              <img src={formatImageUrl(order.image)} alt={order.productName} className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0" />
            )
          )}
          <div className="max-w-[180px]">
            <div className="font-bold text-slate-800 truncate flex items-center gap-1.5" title={order.items?.[0]?.title || order.productName}>
              {order.items?.[0]?.title || order.productName}
              {order.productType === 'custom' && (
                <span className="bg-pink-50 text-pink-600 text-[8px] font-extrabold uppercase px-1 rounded border border-pink-100">Custom</span>
              )}
            </div>
            {order.items && order.items.length > 1 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-100 mt-0.5">
                {order.items.length} Items
              </span>
            ) : (
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{order.storeName}</div>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-2.5">
        <div className="max-w-[180px]">
          <div className="font-bold text-slate-900 truncate">{order.customerName}</div>
          <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{order.customerEmail}</div>
        </div>
      </td>
      <td className="py-3 px-2.5 text-slate-500 font-normal whitespace-nowrap">{order.timestamp}</td>
      <td className="py-3 px-2.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          getDisplayStatus(order) === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          getDisplayStatus(order) === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
          getDisplayStatus(order) === 'Shipped' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
          getDisplayStatus(order) === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
          getDisplayStatus(order) === 'Refunded' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
          'bg-yellow-50 text-yellow-600 border border-yellow-100'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            getDisplayStatus(order) === 'Delivered' ? 'bg-emerald-500' : 
            getDisplayStatus(order) === 'Cancelled' ? 'bg-red-500' : 
            getDisplayStatus(order) === 'Shipped' ? 'bg-blue-500' : 
            getDisplayStatus(order) === 'Pending' ? 'bg-amber-500' : 
            getDisplayStatus(order) === 'Refunded' ? 'bg-purple-500' : 
            'bg-yellow-500'
          }`} />
          {getDisplayStatus(order)}
        </span>
      </td>
      <td className="py-3 px-2.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100">
          <CheckCircle2 size={11} className="text-emerald-600" />
          {order.paymentStatus}
        </span>
      </td>
      <td className="py-3 px-2.5 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
        ₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="py-3 px-2.5">
        <div className="flex items-center justify-center gap-3">
          <ViewBtn
            onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
            title="View Details"
            size={14}
          />
          <div className="relative">
            <select
              value={getDisplayStatus(order)}
              onChange={(e) => handleFulfillmentChange(order._id, e.target.value)}
              disabled={getDisplayStatus(order) === 'Cancelled' || getDisplayStatus(order) === 'Delivered' || getDisplayStatus(order) === 'Refunded'}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-lg appearance-none focus:outline-none transition-all cursor-pointer shadow-2xs disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="Pending" disabled={order.fulfillmentStatus !== 'Pending'}>Pending</option>
              <option value="Processing" disabled={order.fulfillmentStatus !== 'Pending' && order.fulfillmentStatus !== 'Processing'}>Processing</option>
              <option value="Shipped" disabled={order.fulfillmentStatus !== 'Processing' && order.fulfillmentStatus !== 'Shipped'}>Shipped</option>
              <option value="Delivered" disabled={order.fulfillmentStatus !== 'Shipped' && order.fulfillmentStatus !== 'Delivered'}>Delivered</option>
              {getDisplayStatus(order) === 'Cancelled' && <option value="Cancelled">Cancelled</option>}
              {getDisplayStatus(order) === 'Refunded' && <option value="Refunded">Refunded</option>}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full font-sans text-slate-700 antialiased ">
      <PageHeader title="orders management" subtitle="Manage All Orders Placed by customers with detailed insights and real timee">
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
      </PageHeader>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading orders database...</p>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* METRICS SUMMARY */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center border border-blue-100/50"><ShoppingBag size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-blue-500 uppercase block">Total Orders</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{totalOrdersCount}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#002B49] flex items-center justify-center border border-slate-100/10"><IndianRupee size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase block">Total Revenue</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">₹{totalRevenueSum}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center border border-amber-100/50"><Clock size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase block">Pending Orders</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{pendingOrdersCount}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center border border-emerald-100/50"><CheckCircle2 size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-emerald-500 uppercase block">Delivered</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{deliveredOrdersCount}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center border border-red-100/50"><XCircle size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-red-500 uppercase block">Cancelled</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{cancelledOrdersCount}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center border border-purple-100/50"><RotateCw size={18} className="text-white" /></div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-purple-500 uppercase block">Returned</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block mt-0.5">{returnedOrdersCount}</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE 3-BUTTON FILTER ENGINE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-gray-200/80 p-3 rounded-2xl shadow-2xs w-full md:max-w-2xl">
            <button 
              onClick={() => setProductTypeFilter('all')}
              className={`w-full font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                productTypeFilter === 'all' ? 'bg-[#002B49] text-white border border-transparent' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Product
            </button>
            <button 
              onClick={() => setProductTypeFilter('custom')}
              className={`w-full font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                productTypeFilter === 'custom' ? 'bg-[#002B49] text-white border border-transparent' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Custom Product
            </button>
            <button 
              onClick={() => setProductTypeFilter('combo')}
              className={`w-full font-bold uppercase tracking-wider text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                productTypeFilter === 'combo' ? 'bg-[#002B49] text-white border border-transparent' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Combo Product
            </button>
          </div>

          {/* INPUT LOOKUP CONTROLS */}
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

          <AdminTable
            headers={tableHeaders}
            data={paginatedOrders}
            renderRow={renderOrderRow}
            onSort={handleSort}
            sortConfig={sortConfig}
            minWidth="min-w-[950px]"
            containerClassName="touch-pan-x overscroll-x-contain shadow-xs border-slate-200/60"
            className="text-slate-700 font-medium"
            emptyMessage="No matching customer orders found in current search timeline parameters."
          />

          {/* PAGINATION PANEL MODULE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400">
              Showing <span className="font-bold text-slate-700">{sortedOrders.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, sortedOrders.length)}</span> of <span className="font-bold text-slate-700">{sortedOrders.length}</span> orders
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 1
                    ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#002B49] text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className={`border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentPage === totalPages || totalPages <= 1
                    ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

      {/* OVERLAY COMPLETE DETAILED MODAL POPUP VIEW */}
      {isModalOpen && selectedOrder && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 pt-79 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-40 transition-opacity overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col"
          >
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Order Details</h2>
              <button onClick={() => setIsModalOpen(false)} type="button" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-black text-[#002B49] tracking-wide select-all">{selectedOrder.id}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Placed on {selectedOrder.timestamp}</div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-black uppercase tracking-wider ${
                    getDisplayStatus(selectedOrder) === 'Refunded' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                    getDisplayStatus(selectedOrder) === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    getDisplayStatus(selectedOrder) === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <Clock size={12} strokeWidth={2.5} className={
                      getDisplayStatus(selectedOrder) === 'Refunded' ? 'text-purple-700' :
                      getDisplayStatus(selectedOrder) === 'Delivered' ? 'text-emerald-700' :
                      getDisplayStatus(selectedOrder) === 'Cancelled' ? 'text-red-700' :
                      'text-amber-700'
                    } />
                    {getDisplayStatus(selectedOrder)}
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
                  <p className="text-slate-600 font-normal">{selectedOrder.shippingAddress}</p>
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                  <div className="space-y-2 font-medium text-slate-600">
                    <div className="flex gap-1"><span className="text-slate-400 font-normal">Method:</span> <span className="text-slate-900 font-black">{selectedOrder.paymentMethod}</span></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-normal">Status:</span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold border border-emerald-100">
                        <CheckCircle2 size={10} strokeWidth={3} className="text-emerald-600" />{selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Razorpay Order ID</div>
                        <div className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md mt-0.5 font-mono truncate text-[10px] select-all">{selectedOrder.razorpayOrderId}</div>
                      </div>
                      <div className="pt-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Razorpay Payment ID</div>
                        <div className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md mt-0.5 font-mono truncate text-[10px] select-all">{selectedOrder.razorpayPaymentId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRACKING INFORMATION */}
              {selectedOrder.fulfillmentStatus === 'Shipped' && (
                <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-100/60 pb-2">
                    <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider">Tracking Information</h4>
                    <span className="bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Shipped</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                    <div>
                      <span className="text-slate-400 font-normal block">Tracking ID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-900 font-bold select-all">{selectedOrder.trackingId || 'N/A'}</span>
                        {selectedOrder.trackingId && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(selectedOrder.trackingId)}
                            className={`p-1 rounded-md transition-all ${copiedText ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                            title="Copy Tracking ID"
                          >
                            {copiedText ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-normal block">Tracking Link:</span>
                      {selectedOrder.trackingLink ? (
                        <a href={selectedOrder.trackingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold break-all">
                          {selectedOrder.trackingLink}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC VIEW FOR CUSTOM PRODUCTS */}
              {selectedOrder.productType === 'custom' && (
                <div className="bg-pink-50/40 border border-pink-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-pink-100/60 pb-2">
                    <h4 className="text-xs font-black text-pink-700 uppercase tracking-wider">Custom Production Specifications</h4>
                    <span className="bg-pink-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">User Choice</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {selectedOrder.customImage ? (
                      <div className="space-y-1.5 flex-shrink-0 mx-auto sm:mx-0">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Uploaded Image</span>
                        <div 
                          onClick={() => setFullscreenImage(formatImageUrl(selectedOrder.customImage))}
                          className="relative group cursor-pointer w-28 h-28 rounded-xl border border-pink-200 overflow-hidden bg-white shadow-xs"
                        >
                          <img src={formatImageUrl(selectedOrder.customImage)} alt="Custom Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all">Click to Zoom</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDownloadAsset(formatImageUrl(selectedOrder.customImage), `Custom-${selectedOrder.id}.jpg`)}
                          className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                        >
                          <Download size={11} /> Download
                        </button>
                      </div>
                    ) : (
                      selectedOrder.image && (
                        <div className="space-y-1.5 flex-shrink-0 mx-auto sm:mx-0">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Product Image</span>
                          <div className="w-28 h-28 rounded-xl border border-pink-200 overflow-hidden bg-white shadow-xs">
                            <img src={formatImageUrl(selectedOrder.image)} alt="Product Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )
                    )}

                    <div className="flex-1 w-full space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Custom Engraving Text</span>
                      <div className="bg-white border border-pink-100 p-3.5 rounded-xl flex items-start justify-between gap-3 shadow-2xs">
                        <p className="text-slate-800 text-sm font-semibold italic select-all leading-relaxed">
                          {selectedOrder.customText || "No custom engraving data was supplied."}
                        </p>
                        {selectedOrder.customText && (
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(selectedOrder.customText)}
                            className={`p-2 rounded-lg transition-all ${copiedText ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                          >
                            {copiedText ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Order Items</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100">
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Color/Options</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Return Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={item._id || index}>
                          <td className="py-3 px-4">
                            {item.image ? (
                              <img src={formatImageUrl(item.image)} alt={item.title} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 font-bold text-[9px] flex items-center justify-center">N/A</div>
                            )}
                          </td>
                           <td className="py-3 px-4 max-w-[180px]">
                            <div className="text-red-600 font-bold truncate">{item.title}</div>
                            {item.isComboProduct && item.includedProducts && item.includedProducts.length > 0 && (
                              <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Combo Pack Items:</div>
                                <div className="space-y-1.5">
                                  {item.includedProducts.map((incProd, idx) => (
                                    <div key={incProd.id || idx} className="flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                                      {incProd.image ? (
                                        <img src={formatImageUrl(incProd.image)} alt={incProd.title} className="w-7 h-7 object-cover rounded border border-slate-100 flex-shrink-0" />
                                      ) : (
                                        <div className="w-7 h-7 bg-slate-100 rounded border border-slate-200 text-slate-400 text-[8px] flex items-center justify-center flex-shrink-0">N/A</div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="text-[10px] text-slate-700 font-semibold truncate leading-tight" title={incProd.title}>{incProd.title}</div>
                                        <div className="text-[9px] text-slate-400 font-medium">₹{Number(incProd.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Custom Specs */}
                            {(item.selectedOptions?.customImage || item.selectedOptions?.customText || item.selectedOptions?.customization) && (
                              <div className="mt-1.5 p-2 bg-pink-50/50 border border-pink-100 rounded text-[10px] space-y-1">
                                {(item.selectedOptions?.customImage || item.selectedOptions?.customization?.image) && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-semibold">Photo:</span>
                                    <a 
                                      href={formatImageUrl(item.selectedOptions.customImage || item.selectedOptions.customization?.image)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-pink-600 hover:underline font-bold"
                                    >
                                      View Photo
                                    </a>
                                  </div>
                                )}
                                {(item.selectedOptions?.customText || item.selectedOptions?.customization?.text) && (
                                  <div>
                                    <span className="text-slate-400 font-semibold block">Text:</span>
                                    <p className="text-slate-700 italic select-all break-words font-medium">
                                      "{item.selectedOptions.customText || item.selectedOptions.customization?.text}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-normal">
                            {item.selectedOptions
                              ? Object.entries(item.selectedOptions).filter(([k]) => k !== 'customization' && k !== 'customImage' && k !== 'customText').map(([k, v]) => `${k}: ${v}`).join(', ')
                              : 'Standard'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-center border-l border-slate-100">
                            {(!item.returnStatus || item.returnStatus === 'None') ? (
                              <span className="text-slate-400 italic text-[10px]">None</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                                {getReturnStatusBadge(item.returnStatus)}
                                
                                {item.returnReason && (
                                  <div className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded p-1 max-w-[150px] break-words text-left">
                                    <span className="font-bold text-slate-450 uppercase text-[8px] block">Reason:</span>
                                    {item.returnReason}
                                  </div>
                                )}

                                {item.returnPhoto && (
                                  <div className="mt-1">
                                    <span className="font-bold text-slate-450 uppercase text-[8px] block mb-0.5">Proof Image:</span>
                                    <div 
                                      onClick={() => setFullscreenImage(formatImageUrl(item.returnPhoto))}
                                      className="relative group cursor-pointer w-10 h-10 rounded border border-slate-200 overflow-hidden bg-white shadow-2xs hover:border-blue-400 transition-colors"
                                    >
                                      <img src={formatImageUrl(item.returnPhoto)} alt="Proof preview" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[7px] font-bold">Zoom</div>
                                    </div>
                                  </div>
                                )}

                                {item.returnStatus === 'Return Requested' && (
                                  <div className="flex gap-1.5 mt-1">
                                    <button 
                                      type="button"
                                      onClick={() => handleReviewReturn(selectedOrder._id, item._id || item.productId, 'approve')}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer shadow-2xs"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleReviewReturn(selectedOrder._id, item._id || item.productId, 'reject')}
                                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer shadow-2xs"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}

                                {item.returnStatus === 'Return Approved' && (
                                  <div className="mt-1 w-full">
                                    {!item.parcelReceived ? (
                                      <button 
                                        type="button"
                                        onClick={() => handleReceiveParcel(selectedOrder._id, item._id || item.productId)}
                                        className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer shadow-2xs"
                                      >
                                        Mark Parcel Received
                                      </button>
                                    ) : (
                                      <div className="space-y-1">
                                        <span className="inline-block text-[9px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Parcel Received</span>
                                        <button 
                                          type="button"
                                          onClick={() => handleRefundItem(selectedOrder._id, item._id || item.productId)}
                                          className="w-full px-2 py-1 bg-[#002B49] hover:bg-blue-900 text-white text-9px font-bold rounded transition-all cursor-pointer shadow-2xs"
                                        >
                                          Issue Refund
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {item.returnStatus === 'Returned & Refunded' && (
                                  <span className="inline-block text-[9px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Returned & Refunded</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedOrder.gst > 0 && (
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                      <span className="text-slate-500">GST Tax</span>
                      <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.gst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedOrder.shippingFee > 0 && (
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                      <span className="text-slate-500">Shipping Fee</span>
                      <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.shippingFee?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                    <span className="text-slate-700 font-bold">Total Amount</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN ZOOM POPUP */}
      {fullscreenImage && (
        <div 
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 p-4"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => handleDownloadAsset(fullscreenImage, 'fullscreen-custom-asset.jpg')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"><Download size={20} /></button>
            <button type="button" onClick={() => setFullscreenImage(null)} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"><X size={20} /></button>
          </div>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[80vh] overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center"
          >
            <img src={fullscreenImage} alt="Fullscreen View" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* TRACKING DETAILS MODAL */}
      {isTrackingModalOpen && (
        <div 
          onClick={() => setIsTrackingModalOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Enter Shipping & Tracking Details</h2>
              <button onClick={() => setIsTrackingModalOpen(false)} type="button" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Tracking ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. TRAK123456789"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Tracking Link / URL <span className="text-red-500">*</span></label>
                <input
                  type="url"
                  placeholder="e.g. https://track.delhivery.com"
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitTrackingAndShip}
                className="px-4 py-2 bg-[#002B49] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Ship Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;