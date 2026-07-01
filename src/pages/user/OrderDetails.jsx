import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Calendar, MapPin, Package, Phone, Download, Loader, Layers, Copy, Check, Star } from 'lucide-react';
import { getOrderByIdAPI, cancelOrderAPI } from '../../api/orderApi';
import ConfirmationModal from '../../components/ConfirmationModal';
import ReviewModal from '../../components/ReviewModal';
import { toast } from '../../components/toast';
import logo from '../../../public/logo.png';
import {
  addProductReviewAPI,
  getProductReviewsAPI,
  deleteProductReviewAPI
} from '../../api/productApi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import OrderInvoice from '../../components/OrderInvoice';
import { getHomeCMS } from '../../api/homeCms';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Review System Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  // productId -> myReview (or null), used to label buttons before opening the modal
  const [reviewStatusMap, setReviewStatusMap] = useState({});



  const resolveProductId = (item) =>
  item.productId?._id || item.productId || item.id || item._id;

  const invoiceColors = {
    primary: '#003147',    // Brand primary color (Deep Navy Blue)
    secondary: '#F8F9FA'  // Off-white light tint used for subtle body row text/table backgrounds
  };

  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const res = await getHomeCMS();
        if (res && res.data && res.data.contactSetting) {
          setContactData(res.data.contactSetting);
        } else if (res && res.contactSetting) {
          setContactData(res.contactSetting);
        }
      } catch (err) {
        console.error("Error fetching invoice contact details:", err);
      }
    };
    fetchContactSettings();
  }, []);

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

  // Once the order is loaded (and delivered), pre-fetch each item's review
  // status so the buttons correctly say "Edit Review" vs "Review Product"
  // without waiting for the user to open the modal first.
  useEffect(() => {
    const loadReviewStatuses = async () => {
      if (!order || order.status !== 'Delivered' || !order.items?.length) return;

      const uniqueProductIds = [...new Set(order.items.map(resolveProductId))].filter(Boolean);

      const entries = await Promise.all(
        uniqueProductIds.map(async (pid) => {
          try {
            const res = await getProductReviewsAPI(pid);
            return [pid, res.success ? res.data.myReview : null];
          } catch (err) {
            return [pid, null];
          }
        })
      );

      setReviewStatusMap(Object.fromEntries(entries));
    };

    loadReviewStatuses();
  }, [order]);

  const openReviewModal = async (item) => {
    const productId = resolveProductId(item);
    setSelectedReviewItem({ ...item, itemId: productId });
    setIsReviewModalOpen(true);

    try {
      const res = await getProductReviewsAPI(productId);
      if (res.success) {
        setSelectedReviewItem(prev => ({
          ...prev,
          productReviews: res.data.reviews,
          existingReview: res.data.myReview
        }));
        setReviewStatusMap(prev => ({ ...prev, [productId]: res.data.myReview }));
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Could not load review details.");
    }
  };

  const handleReviewSubmit = async (reviewPayload) => {
  try {
    const response = await addProductReviewAPI({
      productId: reviewPayload.itemId,
      rating: reviewPayload.rating,
      description: reviewPayload.description
    });

    if (response.success) {
      toast.success(response.message || "Review posted successfully!");

      const res = await getProductReviewsAPI(reviewPayload.itemId);
      if (res.success) {
        setReviewStatusMap(prev => ({ ...prev, [reviewPayload.itemId]: res.data.myReview }));
        setSelectedReviewItem(prev => prev && ({
          ...prev,
          productReviews: res.data.reviews,
          existingReview: res.data.myReview
        }));
      }
    }
  } catch (error) {
    console.error("Review Submission Error:", error);
    toast.error(error.response?.data?.message || "Could not submit your review.");
    throw error;
  }
};

  const handleReviewDelete = async (productId) => {
    try {
      const response = await deleteProductReviewAPI(productId);
      if (response.success) {
        toast.success("Review deleted.");
        setReviewStatusMap(prev => ({ ...prev, [productId]: null }));
        setIsReviewModalOpen(false);
        setSelectedReviewItem(null);
      }
    } catch (error) {
      console.error("Review Delete Error:", error);
      toast.error(error.response?.data?.message || "Could not delete your review.");
    }
  };

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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Processing': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
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

  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    toast.info('Generating invoice PDF...');
    
    // Temporarily monkeypatch window.getComputedStyle to intercept oklch colors for html2canvas
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (el, pseudoElt) {
      const style = originalGetComputedStyle(el, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          const value = target[prop];
          if (typeof value === 'string' && value.includes('oklch')) {
            return 'rgba(0, 0, 0, 0)';
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };

    try {
      const element = document.getElementById('order-invoice-download-template');
      if (!element) {
        toast.error('Invoice template not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Invoice-${order.orderId || order._id}.pdf`;
      pdf.save(filename);
     
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice PDF');
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setDownloading(false);
    }
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
    <div className="bg-[#fcf9f5] min-h-screen py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8 font-['Inter'] print:bg-white print:py-0 print:px-0">

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --invoice-primary: ${invoiceColors.primary};
          --invoice-secondary: ${invoiceColors.secondary};
        }
        @media print {
          body * { visibility: hidden; }
          #printable-invoice-area, #printable-invoice-area * { visibility: visible; }
          #printable-invoice-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px !important; }
        }
      `}} />

      {/* Main Container Dashboard Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 print:hidden">

        {/* Detail Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link
            to="/my-account/orders"
            className="flex items-center space-x-1.5 text-gray-600 hover:text-[#009EDB] transition-colors border border-gray-200 px-3 py-1.5 rounded-md font-medium text-[13px] w-fit shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Orders</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 break-all">
              {order.orderId || `Order #${order._id.slice(-8).toUpperCase()}`}
            </h2>
            <div className="flex items-center flex-wrap gap-2">
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

        {/* Dashboard Grid Container */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#fcfcfc]">

          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3">
                <Calendar size={16} className="text-[#009EDB]" />
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

            {order.trackingId && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-4 border-b border-blue-200/50 pb-3">
                  <Package size={16} className="text-[#009EDB]" />
                  <span>Tracking Information</span>
                </h3>
                <div className="space-y-3 text-[13px] font-medium text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-xs font-semibold">Tracking ID</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-extrabold text-[#003147] select-all break-all">{order.trackingId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingId)}
                        className={`p-1 rounded-md transition-all ${copiedTracking ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                      >
                        {copiedTracking ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-semibold">Tracking Link</span>
                    {order.trackingLink ? (
                      <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="text-[#009EDB] hover:underline font-bold break-all flex items-center gap-1.5">
                        Click here to track your package
                      </a>
                    ) : (
                      <span className="text-slate-400">Not Available</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3">
                <MapPin size={16} className="text-[#009EDB]" />
                <span>Shipping Address</span>
              </h3>
              <div className="text-[13px] space-y-3">
                <p className="font-extrabold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                {order.shippingAddress?.phone && (
                  <div className="flex items-center space-x-2 text-gray-500 font-semibold pt-1 border-t border-gray-50">
                    <Phone size={13} className="text-[#009EDB]" />
                    <span>PH: {order.shippingAddress.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-[#003147] font-bold text-sm mb-4 border-b border-gray-50 pb-3">
                <Package size={16} className="text-[#009EDB]" />
                <span>Items ({order.items?.length || 0})</span>
              </h3>

             <div className="space-y-4">
  {order.items?.map((item, index) => {
    const productId = resolveProductId(item);
    const hasReview = !!reviewStatusMap[productId];

    return (
      <div 
        key={index} 
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0"
      >
        {/* Left Side: Product Image & Metadata Details */}
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1 flex-shrink-0 relative">
            <img 
              src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))} 
              alt={item.title || item.name} 
              className="w-full h-full object-cover rounded-md" 
            />
            {item.isComboProduct && (
              <div className="absolute bottom-0 inset-x-0 bg-blue-900/90 text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-0.5">
                <Layers size={8} /> Combo
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-sm mb-0.5 truncate">{item.title || item.name}</p>
            
            {item.isComboProduct ? (
              <>
                <span className="inline-block mb-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  ✨ Combo Bundle Savings Deal
                </span>
                {item.includedProducts && item.includedProducts.length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-dashed border-gray-200 pt-2 mb-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Includes:</p>
                    <div className="grid grid-cols-1 gap-1.5 max-w-md">
                      {item.includedProducts.map((incProd, idx) => (
                        <div key={incProd.id || idx} className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                          {incProd.image ? (
                            <img src={formatImageUrl(incProd.image)} alt={incProd.title} className="w-8 h-8 object-cover rounded border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 text-gray-400 text-[8px] flex items-center justify-center flex-shrink-0">N/A</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-700 font-bold truncate leading-tight" title={incProd.title}>{incProd.title}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">₹{Number(incProd.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-medium text-gray-500 mb-1">
                {item.selectedOptions && Object.entries(item.selectedOptions)
                  .filter(([key]) => !['customImage', 'customText', 'customization'].includes(key))
                  .map(([key, val]) => (
                    <span key={key} className="capitalize">{key}: {val}</span>
                  ))
                }
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>Qty: {item.quantity || item.qty}</span>
              <span>•</span>
              <span>₹{Number(item.price).toFixed(2)} each</span>
            </div>
          </div>
        </div>

        {/* Right Side: Review Action Button Trigger */}
        <div className="flex-shrink-0 self-start sm:self-center">
          {order.status?.toLowerCase() === 'delivered' ? (
            <button
              onClick={() =>  openReviewModal(item)}
              className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                hasReview 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {hasReview ? '⭐ Edit Your Review' : '✍️ Write Product Review'}
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
              Review locks until Delivery
            </span>
          )}
        </div>

      </div>
    );
  })}
</div>

            <div className="bg-[#f9fafb] border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
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

            <button 
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="w-full bg-[#003147] text-white flex items-center justify-center space-x-2 py-2.5 rounded-xl hover:bg-[#002232] transition-colors font-bold shadow-md text-xs sm:text-sm cursor-pointer active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={15} className={downloading ? "animate-bounce" : ""} />
              <span>{downloading ? "Downloading..." : "Download Invoice"}</span>
            </button>
          </div>
        </div>
      </div>
      

      {/* Printable Invoice View Layer */}
      <div id="printable-invoice-area" className="hidden print:block bg-white text-black font-sans" style={{ fontSize: '11px', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E5E7EB', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#3b6094', fontSize: '32px', fontWeight: '800', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Invoice</h1>
            <p style={{ margin: '0', color: '#334c6e', fontWeight: '500' }}>Official Order Bill Receipt</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <img src={logo} alt="Flora Flowers Logo" style={{ maxHeight: '75px', maxWidth: '200px', objectFit: 'contain' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '25px' }}>
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '6px' }}>Your Information</h3>
            <p style={{ margin: '0', fontWeight: '700', color: '#1F2937' }}>P2J Mart E-Commerce Inc.</p>
            <p style={{ margin: '3px 0 0 0', color: '#4B5563' }}>123 Gift Street, Joy City</p>
            <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>support@p2jmart.com</p>
            <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>+91-999-888-7777</p>
          </div>
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '6px' }}>Client Information</h3>
            <p style={{ margin: '0', fontWeight: '700', color: '#1F2937' }}>{order.shippingAddress?.fullName || 'Valued Customer'}</p>
            <p style={{ margin: '3px 0 0 0', color: '#4B5563' }}>{order.shippingAddress?.streetAddress}</p>
            <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
            {order.shippingAddress?.phone && <p style={{ margin: '2px 0 0 0', color: '#4B5563' }}>PH: {order.shippingAddress.phone}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '25px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', margin: '0 0 4px 0' }}>Issued On</h3>
            <p style={{ margin: '0', fontWeight: '600', color: '#374151' }}>{formatDate(order.placedDate || order.createdAt)}</p>
          </div>
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', margin: '0 0 4px 0' }}>Order ID</h3>
            <p style={{ margin: '0', fontWeight: '700', color: '#374151' }}>{order.orderId || `ORD-${order._id.slice(-8).toUpperCase()}`}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px', border: '1px solid #D1D5DB' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--invoice-primary)', color: '#FFFFFF' }}>
              <th style={{ padding: '10px', fontSize: '10px', fontWeight: '700', width: '50px', textAlign: 'center', borderRight: '1px solid #D1D5DB' }}>S.NO</th>
              <th style={{ padding: '10px', fontSize: '10px', fontWeight: '700', textAlign: 'left', borderRight: '1px solid #D1D5DB' }}>ITEM DESCRIPTION</th>
              <th style={{ padding: '10px', fontSize: '10px', fontWeight: '700', width: '80px', textAlign: 'center', borderRight: '1px solid #D1D5DB' }}>QUANTITY</th>
              <th style={{ padding: '10px', fontSize: '10px', fontWeight: '700', width: '110px', textAlign: 'center', borderRight: '1px solid #D1D5DB' }}>UNIT PRICE</th>
              <th style={{ padding: '10px', fontSize: '10px', fontWeight: '700', width: '120px', textAlign: 'right' }}>TOTAL PRICE</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index} style={{ backgroundColor: 'var(--invoice-secondary)', borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#4B5563', borderRight: '1px solid #D1D5DB' }}>{index + 1}</td>
                <td style={{ padding: '12px 10px', borderRight: '1px solid #D1D5DB' }}>
                  <div style={{ fontWeight: '700', color: '#1F2937' }}>{item.title || item.name}</div>
                  {item.selectedOptions && !item.isComboProduct && (
                    <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                      {Object.entries(item.selectedOptions)
                        .filter(([key]) => !['customImage', 'customText', 'customization'].includes(key))
                        .map(([key, val]) => `${key}: ${val}`).join(', ')}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', color: '#1F2937', borderRight: '1px solid #D1D5DB' }}>{item.quantity || item.qty}</td>
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#4B5563', borderRight: '1px solid #D1D5DB' }}>Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#1F2937' }}>Rs. {(Number(item.price) * Number(item.quantity || item.qty || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '20px', paddingRight: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 100px', gap: '10px', textAlign: 'right', color: '#4B5563', fontSize: '13px' }}></div>
            <span style={{ color: '#9CA3AF', fontWeight: '500' }}>Subtotal:</span>
            <span style={{ fontWeight: '600', color: '#374151' }}>Rs. {Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            {order.gst > 0 && (
              <>
                <span style={{ color: '#9CA3AF', fontWeight: '500' }}>GST:</span>
                <span style={{ fontWeight: '600', color: '#374151' }}>Rs. {Number(order.gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </>
            )}
            <span style={{ color: '#9CA3AF', fontWeight: '500' }}>Shipping:</span>
            <span style={{ fontWeight: '600', color: '#374151' }}>{Number(order.shippingFee || 0) === 0 ? "Free" : `Rs. ${Number(order.shippingFee).toFixed(2)}`}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 120px', gap: '10px', textAlign: 'right', marginTop: '15px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#132844' }}>Total Amount Due:</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#2e75d8' }}>Rs. {Number(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '220px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #4B5563', marginBottom: '6px' }}></div>
            <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Authorized Signature</span>
          </div>
        </div>

        <div style={{ marginTop: '60px', backgroundColor: 'var(--invoice-primary)', color: '#FFFFFF', padding: '14px 18px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px' }}>
            Thank you for choosing P2J MART! We appreciate the opportunity to serve you.
          </p>
          <p style={{ margin: '0', fontSize: '10px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400', lineHeight: '1.5' }}>
            Please note that payment conditions apply based on terms of billing. If you have any questions or concerns regarding this invoice record statement, feel free to contact us at the provided support email address.
          </p>
        </div>
      </div>

      {/* Off-screen container for rendering A4 invoice for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <OrderInvoice 
          order={order} 
          invoiceColors={invoiceColors} 
          formatImageUrl={formatImageUrl} 
          formatDate={formatDate} 
          contactData={contactData}
        />
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

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setSelectedReviewItem(null); }}
        item={selectedReviewItem}
        formatImageUrl={formatImageUrl}
        onSubmit={handleReviewSubmit}
        onDelete={handleReviewDelete}
      />
    </div>
  );
};

export default OrderDetails;