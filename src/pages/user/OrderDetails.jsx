import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Calendar, MapPin, Package, Phone, Download, Loader, Layers, Copy, Check } from 'lucide-react';
import { getOrderByIdAPI, cancelOrderAPI } from '../../api/orderApi';
import ConfirmationModal from '../../components/ConfirmationModal';
import { toast } from '../../components/toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderByIdAPI(id);
      if (response && response.success && response.data) {
        setOrder(response.data);
      } else if (response) {
        setOrder(response);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelConfirm = async () => {
    try {
      setCancelling(true);
      const response = await cancelOrderAPI(id);
      if (response && response.success) {
        toast.success('Order cancelled successfully.');
        setOrder(response.data);
      } else {
        toast.success('Order cancelled.');
        fetchOrderDetails();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Shipped':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Delivered':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image+Available";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-6 lg:px-8 bg-[#fcf9f5] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-[#003147] animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-6 lg:px-8 bg-[#fcf9f5] flex flex-col items-center justify-center font-['Inter']">
        <h2 className="text-lg font-bold text-[#003147] mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">The order you are looking for does not exist or has been removed.</p>
        <Link 
          to="/my-account/orders" 
          className="bg-[#003147] text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#009EDB] transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f5] min-h-screen py-6 px-4 md:px-6 lg:px-8 font-['Inter'] print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 print:shadow-none print:border-none">
        
        {/* Detail Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <Link 
            to="/my-account/orders"
            className="flex items-center space-x-1.5 text-gray-600 hover:text-[#009EDB] transition-colors border border-gray-200 px-3 py-1.5 rounded-md font-medium text-[13px] w-fit shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Orders</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              {order.orderId || `Order #${order._id.slice(-8).toUpperCase()}`}
            </h2>
            <div className="flex items-center space-x-2.5">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getStatusColorClass(order.status)}`}>
                {order.status}
              </span>
              {order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Shipped' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={cancelling}
                  className="flex items-center space-x-1 border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={12} />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Print Header for Invoice Mode */}
        <div className="hidden print:block p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-[#003147] tracking-tight">P2J MART</h1>
              <p className="text-xs text-gray-500 mt-1">Official Invoice Receipt</p>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold text-gray-800">INVOICE</h2>
              <p className="text-xs text-gray-500 mt-1">{order.orderId || `Order ID: ${order._id}`}</p>
              <p className="text-xs text-gray-500">Date: {formatDate(order.placedDate || order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fcfcfc] print:bg-white print:p-8">
          
          {/* Left Column - Info & Address */}
          <div className="lg:col-span-5 space-y-5 print:col-span-6">
            
            {/* Order Information Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm print:shadow-none print:border-gray-200">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3 print:border-gray-200">
                <Calendar size={16} className="text-[#009EDB] print:hidden" />
                <span>Order Information</span>
              </h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Date:</span>
                  <span className="font-semibold text-gray-800">{formatDate(order.placedDate || order.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Status:</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColorClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-semibold text-gray-800 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Details Card */}
            {order.trackingId && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm print:hidden">
                <h3 className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-4 border-b border-blue-200/50 pb-3">
                  <Package size={16} className="text-[#009EDB]" />
                  <span>Tracking Information</span>
                </h3>
                <div className="space-y-3 text-[13px] font-medium text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-xs font-semibold">Tracking ID</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-[#003147] select-all">{order.trackingId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingId)}
                        className={`p-1 rounded-md transition-all ${copiedTracking ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                        title="Copy Tracking ID"
                      >
                        {copiedTracking ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-semibold">Tracking Link</span>
                    {order.trackingLink ? (
                      <a 
                        href={order.trackingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#009EDB] hover:underline font-bold break-all flex items-center gap-1.5"
                      >
                        Click here to track your package
                      </a>
                    ) : (
                      <span className="text-slate-400">Not Available</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm print:shadow-none print:border-gray-200">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3 print:border-gray-200">
                <MapPin size={16} className="text-[#009EDB] print:hidden" />
                <span>Shipping Address</span>
              </h3>
              <div className="text-[13px] space-y-3">
                <p className="font-extrabold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                {order.shippingAddress?.phone && (
                  <div className="flex items-center space-x-2 text-gray-500 font-semibold pt-1 border-t border-gray-50 print:border-gray-200">
                    <Phone size={13} className="text-[#009EDB] print:hidden" />
                    <span>PH: {order.shippingAddress.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column - Items & Summary */}
          <div className="lg:col-span-7 space-y-5 print:col-span-6">
            
            {/* Items Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm print:shadow-none print:border-gray-200">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3 print:border-gray-200">
                <Package size={16} className="text-[#009EDB] print:hidden" />
                <span>Items ({order.items?.length || 0})</span>
              </h3>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0 print:border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Link 
                        to={item.isComboProduct && item.includedProducts?.[0]
                          ? `/product/${item.includedProducts[0].id || item.includedProducts[0]._id || item.includedProducts[0].productId}`
                          : `/product/${item.productId}`
                        }
                        className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1 flex-shrink-0 print:hidden relative block cursor-pointer"
                      >
                        <img 
                          src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))} 
                          alt={item.title || item.name} 
                          className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-200" 
                        />
                        {item.isComboProduct && (
                          <div className="absolute bottom-0 inset-x-0 bg-blue-900/90 text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-0.5">
                            <Layers size={8} /> Combo
                          </div>
                        )}
                      </Link>
                      <div>
                        <p className="font-bold text-gray-800 text-sm mb-0.5">{item.title || item.name}</p>
                        
                        {item.isComboProduct ? (
                          <span className="inline-block mb-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                            ✨ Combo Bundle Savings Deal
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-medium text-gray-500 mb-1">
                            {item.selectedOptions && Object.entries(item.selectedOptions)
                              .filter(([key]) => key !== 'customImage' && key !== 'customText' && key !== 'customization')
                              .map(([key, val]) => (
                                <span key={key} className="capitalize">{key}: {val}</span>
                              ))
                            }
                          </div>
                        )}

                        {/* Nested Combo items listing */}
                        {item.isComboProduct && item.includedProducts && (
                          <div className="mt-2 mb-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2 max-w-sm">
                            <p className="text-[8px] sm:text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                              Included Products:
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {item.includedProducts.map((subItem, index) => (
                                <div key={subItem.id || index} className="flex items-center gap-1.5 bg-white border border-slate-100 p-1 rounded">
                                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200/85 overflow-hidden shrink-0">
                                    <img 
                                      src={formatImageUrl(subItem.image)} 
                                      alt={subItem.productName || subItem.title} 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  <span className="truncate text-gray-800 text-[10px] font-semibold flex-1">
                                    {subItem.productName || subItem.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span>Qty: {item.quantity || item.qty}</span>
                          <span>•</span>
                          <span>₹{Number(item.price).toFixed(2)} each</span>
                        </div>

                        {/* Custom Design / Text details */}
                        {(item.selectedOptions?.customImage || item.selectedOptions?.customText || item.selectedOptions?.customization) && (
                          <div className="mt-2 p-3 bg-pink-50/50 border border-pink-100 rounded-lg text-xs space-y-2 max-w-sm">
                            <p className="font-bold text-pink-700 uppercase text-[9px] tracking-wider">Custom Specifications</p>
                            {(item.selectedOptions?.customImage || item.selectedOptions?.customization?.image) && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-medium">Uploaded Photo:</span>
                                <a 
                                  href={formatImageUrl(item.selectedOptions.customImage || item.selectedOptions.customization?.image)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#009EDB] hover:underline font-bold"
                                >
                                  View Photo
                                </a>
                              </div>
                            )}
                            {(item.selectedOptions?.customText || item.selectedOptions?.customization?.text) && (
                              <div>
                                <span className="text-gray-500 font-medium block">Custom Text:</span>
                                <p className="text-gray-800 font-semibold italic bg-white p-2 border border-pink-100 rounded mt-0.5 select-all">
                                  "{item.selectedOptions.customText || item.selectedOptions.customization?.text}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-[#f9fafb] border border-gray-100 rounded-xl p-5 shadow-sm print:shadow-none print:border-gray-200 print:bg-white">
              <div className="space-y-2.5 text-[13px] border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {order.gst > 0 && (
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>GST Calculated</span>
                    <span>₹{Number(order.gst).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Shipping Fee</span>
                  <span>{Number(order.shippingFee || 0) === 0 ? "FREE" : `₹${Number(order.shippingFee).toFixed(2)}`}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-base font-black text-[#003147]">
                <span>Total Amount</span>
                <span>₹{Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Download Invoice Button */}
            <button 
              onClick={handlePrint}
              className="w-full bg-[#003147] text-white flex items-center justify-center space-x-2 py-2.5 rounded-xl hover:bg-[#002232] transition-colors font-bold shadow-md text-xs sm:text-sm cursor-pointer print:hidden active:scale-95 duration-200"
            >
              <Download size={15} />
              <span>Print Invoice Receipt</span>
            </button>

          </div>

        </div>
      </div>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message={`Are you sure you want to cancel this order? This action cannot be reversed.`}
        confirmText="Cancel Order"
        isDanger={true}
      />
    </div>
  );
};

export default OrderDetails;
