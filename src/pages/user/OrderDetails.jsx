import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Calendar, MapPin, Package, Phone, Download, Loader, Layers, Copy, Check, Star } from 'lucide-react';
import { getOrderByIdAPI, cancelOrderAPI, requestItemReturnAPI } from '../../api/orderApi';
import ConfirmationModal from '../../components/ConfirmationModal';
import ReviewModal from '../../components/ReviewModal';
import { toast } from '../../components/toast';
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

  // Return System States
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const isReturnWindowOpen = (item, deliveredAt) => {
    if (!item.returnPolicy || item.returnPolicy === 'No Return Policy' || item.returnPolicy === 'Select Return Days') {
      return false;
    }
    const match = item.returnPolicy.match(/^(\d+)\s+day/i);
    if (!match) return false;
    const returnWindowDays = parseInt(match[1], 10);
    const deliveredTime = deliveredAt || order?.statusDate || order?.updatedAt;
    if (!deliveredTime) return false;
    const elapsedDays = (Date.now() - new Date(deliveredTime).getTime()) / (1000 * 60 * 60 * 24);
    return elapsedDays <= returnWindowDays;
  };

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case 'Return Requested':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Return Requested</span>;
      case 'Return Approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Return Approved (Awaiting Parcel)</span>;
      case 'Return Rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Return Rejected</span>;
      case 'Returned & Refunded':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Returned & Refunded</span>;
      default:
        return null;
    }
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (returnPhotos.length + files.length > 3) {
      toast.error('You can upload a maximum of 3 proof photos');
      return;
    }

    const newPhotos = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image "${file.name}" size must be less than 2MB`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newPhotos.push(base64);
      } catch (err) {
        toast.error(`Failed to process image "${file.name}"`);
      }
    }
    if (newPhotos.length > 0) {
      setReturnPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
    }
    e.target.value = '';
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      toast.error('Please specify a return reason');
      return;
    }
    if (returnPhotos.length === 0) {
      toast.error('Please upload at least one product photo proof');
      return;
    }

    try {
      setSubmittingReturn(true);
      const res = await requestItemReturnAPI(order._id, selectedReturnItem._id, {
        returnReason,
        returnPhoto: returnPhotos
      });
      if (res.success) {
        toast.success('Return request submitted successfully');
        setIsReturnModalOpen(false);
        setReturnReason('');
        setReturnPhotos([]);
        if (res.data) {
          setOrder(res.data);
        } else {
          fetchOrderDetails();
        }
      } else {
        toast.error(res.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const resolveProductId = (item) =>
    item.productId?._id || item.productId || item.id || item._id;

  const formatOptionValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return val.name || val.value || JSON.stringify(val);
    }
    return String(val);
  };

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
        // Refresh this product's status so the button label updates immediately
        setReviewStatusMap(prev => ({
          ...prev,
          [reviewPayload.itemId]: {
            rating: reviewPayload.rating,
            description: reviewPayload.description,
            createdAt: new Date().toISOString()
          }
        }));
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
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between items-start gap-3 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start space-x-4 min-w-0 flex-1">
                        <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1 flex-shrink-0 relative">
                          <img src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))} alt={item.title || item.name} className="w-full h-full object-cover rounded-md" />
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
                                  <span key={key} className="capitalize">{key}: {formatOptionValue(val)}</span>
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

                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        {order.status === 'Delivered' && (
                          <button
                            onClick={() => openReviewModal(item)}
                            className="flex items-center justify-center space-x-1 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-500 hover:text-white hover:border-amber-500 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all shadow-sm cursor-pointer w-full sm:w-auto flex-shrink-0"
                          >
                            <Star size={11} className="fill-current" />
                            <span>{hasReview ? 'Edit Review' : 'Review Product'}</span>
                          </button>
                        )}

                        {item.returnStatus && item.returnStatus !== 'None' ? (
                          <div className="flex-shrink-0">
                            {getReturnStatusBadge(item.returnStatus)}
                          </div>
                        ) : (
                          order.status === 'Delivered' && isReturnWindowOpen(item, order.deliveredAt || order.statusDate) && (
                            <button
                              onClick={() => {
                                setSelectedReturnItem(item);
                                setIsReturnModalOpen(true);
                              }}
                              className="flex items-center justify-center border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-500 hover:text-white hover:border-rose-500 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all shadow-sm cursor-pointer w-full sm:w-auto flex-shrink-0"
                            >
                              Return Product
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
      {/* Off-screen container for rendering A4 invoice for PDF generation & printing */}
      <div id="printable-invoice-area" className="hidden print:block" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
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

      {/* Return Request Modal */}
      {isReturnModalOpen && selectedReturnItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsReturnModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle size={20} />
            </button>
            <h3 className="text-lg font-bold text-[#001E3C] mb-4">Request Item Return</h3>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
              <img
                src={formatImageUrl(selectedReturnItem.image || (selectedReturnItem.includedProducts && selectedReturnItem.includedProducts[0]?.image))}
                alt={selectedReturnItem.title}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#001E3C] truncate">{selectedReturnItem.title}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Policy: {selectedReturnItem.returnPolicy}</p>
              </div>
            </div>

            {selectedReturnItem.isComboProduct && selectedReturnItem.includedProducts && selectedReturnItem.includedProducts.length > 0 && (
              <div className="mb-4 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-1.5">
                  Combo Pack Items (All will be returned together):
                </span>
                <div className="space-y-1.5">
                  {selectedReturnItem.includedProducts.map((incProd, idx) => (
                    <div key={incProd.id || idx} className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white rounded border border-gray-150 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {incProd.image ? (
                          <img src={formatImageUrl(incProd.image)} alt={incProd.title} className="w-full h-full object-cover" />
                        ) : (
                          <Layers size={10} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-gray-700 font-bold truncate block">{incProd.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Reason for Return
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Why are you returning this item?"
                  className="w-full border border-gray-200 p-2.5 text-xs rounded-xl focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Proof Photo Upload (Max 2MB per photo)</span>
                  <span className="text-gray-400 font-bold">{returnPhotos.length} / 3</span>
                </label>

                {/* Uploaded thumbnails grid */}
                {returnPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {returnPhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                        <img src={photo} alt={`Proof preview ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setReturnPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow hover:bg-rose-700 transition-colors"
                          title="Remove photo"
                        >
                          <XCircle size={14} className="fill-current text-white bg-rose-600 rounded-full" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dashed upload box */}
                {returnPhotos.length < 3 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50/50 transition-all relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center py-2 text-gray-400">
                      <Layers size={20} className="mb-1" />
                      <span className="text-xs font-medium">Select or drag proof photo</span>
                      <span className="text-[10px] mt-0.5">JPEG, PNG only (Up to 3 photos)</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={submittingReturn}
                className="w-full bg-[#001E3C] hover:bg-[#002d5a] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {submittingReturn && <Loader size={12} className="animate-spin" />}
                <span>{submittingReturn ? 'Submitting...' : 'Submit Return Request'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;