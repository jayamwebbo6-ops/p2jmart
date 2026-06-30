import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersAPI } from '../../api/orderApi';
import { Package, Calendar, Loader, ChevronRight } from 'lucide-react';
import { toast } from '../../components/toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getMyOrdersAPI();
        if (response && response.success && Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (Array.isArray(response)) {
          setOrders(response);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="flex-1 bg-white h-full p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader className="w-8 h-8 text-[#003147] animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 bg-white h-full p-8 flex flex-col items-center justify-center min-h-[350px] text-center font-['Inter']">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-[#003147]">
          <Package size={28} strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-[#003147] mb-1">No Orders Placed Yet</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-sm">
          You haven't ordered anything yet. Browse our collections and place your first order!
        </p>
        <Link 
          to="/" 
          className="bg-[#003147] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#009EDB] transition-colors shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white h-full p-4 sm:p-8 font-['Inter']">
      <h1 className="text-lg sm:text-2xl font-bold text-[#003147] mb-6">Order History</h1>
      <div className="space-y-4">
        {currentOrders.map((order) => {
          const orderId = order._id || order.id;
          const firstItem = order.items?.[0];
          return (
            <Link 
              key={orderId}
              to={`/my-account/order/${orderId}`}
              className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#009EDB]/30 hover:shadow-md transition-all bg-white block relative group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                  <img 
                    src={formatImageUrl(firstItem?.image)} 
                    alt={firstItem?.title || "Product"} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-gray-800 text-sm">
                      {order.orderId || `Order #${orderId.slice(-8).toUpperCase()}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColorClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    Placed on {formatDate(order.placedDate || order.createdAt)}
                  </p>
                  <p className="text-[#003147] font-bold text-xs sm:text-sm mt-1">
                    Total: ₹{Number(order.total || 0).toFixed(2)} ({order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'})
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end self-end sm:self-center gap-1 text-[#003147] group-hover:text-[#009EDB] transition-colors text-xs font-semibold">
                <span>View Details</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#003147] hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#003147] border-[#003147] text-white shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#003147] hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
