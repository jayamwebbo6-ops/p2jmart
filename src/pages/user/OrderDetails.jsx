import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, XCircle, Calendar, MapPin, Package, Phone, Download } from 'lucide-react';
import { mockOrders } from '../../utils/mockOrders';
import ConfirmationModal from '../../components/ConfirmationModal';

const OrderDetails = () => {
  const { id } = useParams();
  const selectedOrder = mockOrders.find(order => order.id === id) || mockOrders[0];
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelConfirm = () => {
    // Implement order cancellation logic here (e.g. API call)
    console.log(`Cancelled order ${selectedOrder.id}`);
  };

  return (
    <div className="bg-[#fcf9f5] min-h-screen py-6 px-4 md:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        
        {/* Detail Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            to="/my-account/orders"
            className="flex items-center space-x-1.5 text-gray-600 hover:text-primary transition-colors border border-gray-200 px-3 py-1.5 rounded-md font-medium text-[13px] w-fit shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Orders</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <h2 className="text-lg font-medium text-gray-800">Order {selectedOrder.id}</h2>
            <div className="flex items-center space-x-2.5">
              <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-medium ${selectedOrder.statusColor}`}>
                {selectedOrder.status}
              </span>
              {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
               <button
  onClick={() => setIsCancelModalOpen(true)}
  className="flex items-center space-x-1 border border-red-500 text-red-600 px-2.5 py-0.5 rounded-md text-[11px] font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-sm"
>
  <XCircle size={12} />
  <span>Cancel Order</span>
</button>
              )}
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fcfcfc]">
          
          {/* Left Column - Info & Address */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Order Information Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-primary font-semibold text-sm mb-4 border-b border-gray-50 pb-3">
                <Calendar size={16} />
                <span>Order Information</span>
              </h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Date:</span>
                  <span className="font-medium text-gray-800">{selectedOrder.placedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Status:</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${selectedOrder.statusColor}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium text-gray-800">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-primary font-semibold text-sm mb-4 border-b border-gray-50 pb-3">
                <MapPin size={16} />
                <span>Shipping Address</span>
              </h3>
              <div className="text-[13px] space-y-3">
                <p className="font-bold text-gray-800 text-sm">{selectedOrder.shippingAddress.name}</p>
                <p className="text-gray-600 leading-relaxed">
                  {selectedOrder.shippingAddress.address} PH: {selectedOrder.shippingAddress.phone}
                </p>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone size={13} />
                  <span>{selectedOrder.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column - Items & Summary */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Items Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="flex items-center space-x-2 text-primary font-semibold text-sm mb-4 border-b border-gray-50 pb-3">
                <Package size={16} />
                <span>Items ({selectedOrder.items.length})</span>
              </h3>
              
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm mb-0.5">{item.name}</p>
                        <div className="flex items-center space-x-3 text-[12px] text-gray-500">
                          <span>Color: {item.color}</span>
                          <span>Qty: {item.qty}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-0.5">₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="font-medium text-gray-800 text-sm">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-[#f9fafb] border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="space-y-2.5 text-[13px] border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{selectedOrder.shipping.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-gray-800">
                <span>Total</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Download Invoice Button */}
            <button className="w-full bg-primary text-white flex items-center justify-center space-x-2 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md text-[13px]">
              <Download size={15} />
              <span>Download Invoice</span>
            </button>

          </div>

        </div>
      </div>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order ${selectedOrder.id}? This action cannot be reversed.`}
        confirmText="Cancel Order"
        isDanger={true}
      />
    </div>
  );
};

export default OrderDetails;
