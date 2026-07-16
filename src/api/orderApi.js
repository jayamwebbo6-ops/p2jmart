import api from './api';
import userApi from './userApi';

// Create a new order
export const createOrderAPI = async (orderData) => {
  const response = await userApi.post('/orders/create-order', orderData);
  return response.data;
};

// Retrieve my orders
export const getMyOrdersAPI = async () => {
  const response = await userApi.get('/orders/get-my-orders');
  return response.data;
};

// Get order details by ID
export const getOrderByIdAPI = async (id) => {
  const response = await userApi.get(`/orders/get-order/${id}`);
  return response.data;
};

// Cancel an order (Updated to accept and pass the reason object)
export const cancelOrderAPI = async (id, reason) => {
  const response = await userApi.put(`/orders/cancel-order/${id}`, { reason });
  return response.data;
};

// Admin: Get all orders
export const adminGetAllOrdersAPI = async () => {
  const response = await api.get('/orders/admin/get-all-orders');
  return response.data;
};

// Admin: Update order status
export const adminUpdateOrderStatusAPI = async (id, status, trackingData = {}) => {
  const response = await api.put(`/orders/admin/update-status/${id}`, { status, ...trackingData });
  return response.data;
};

// User: Submit return request for an item
export const requestItemReturnAPI = async (orderId, itemId, returnData) => {
  const response = await userApi.put(`/orders/${orderId}/items/${itemId}/return-request`, returnData);
  return response.data;
};


// Admin: Mark returned item parcel as received
export const adminReceiveParcelAPI = async (orderId, itemId) => {
  const response = await api.put(`/orders/${orderId}/items/${itemId}/admin/receive-parcel`);
  return response.data;
};

// Admin: Process refund and finalize return for an item
export const adminRefundItemAPI = async (orderId, itemId) => {
  const response = await api.put(`/orders/${orderId}/items/${itemId}/admin/refund-item`);
  return response.data;
};



// Admin: Get all return requests (Points to the pooled backend route)
export const adminGetReturnRequestsAPI = async () => {
  const response = await api.get('/orders/admin/return-requests');
  return response.data;
};

// Admin: Get all orders requiring refund
export const adminGetRefundRequiredOrdersAPI = async () => {
  const response = await api.get('/orders/admin/refund-required');
  return response.data;
};

// Admin: Initiate refund for order
export const adminInitiateOrderRefundAPI = async (id, notes = '') => {
  const response = await api.put(`/orders/admin/refund/${id}/initiate`, { notes });
  return response.data;
};

// Admin: Complete refund for order
export const adminCompleteOrderRefundAPI = async (id, notes = '') => {
  const response = await api.put(`/orders/admin/refund/${id}/complete`, { notes });
  return response.data;
};


// Admin: Get all cancellation requests (Pulls from the pooled data route)
export const adminGetCancellationRequestsAPI = async () => {
  // Fix: Point this to your actual cancellation backend route
  const response = await api.get('/orders/admin/cancellations'); 
  return response.data;
};

export const adminReviewCancellationAPI = async (orderId, itemId, action) => {
  const targetStatus = action === 'approve' ? 'Cancelled' : 'Cancellation Rejected';
  const response = await api.put(`/orders/admin/orders/review-cancellation/${orderId}`, { 
    status: targetStatus 
  });
  return response.data;
};



// Admin: Approve or Reject an individual item return request
// FIX: Swapped from POST to PUT, matching your structural URL mapping
export const adminReviewReturnAPI = async (orderId, itemId, action) => {
  const response = await api.put(`/orders/${orderId}/items/${itemId}/admin/review-return`, { 
    action // expects 'approve' or 'reject' inside the request body
  });
  return response.data;
};


export const adminLogout = () => {
  deleteCookie('p2jmart_admin_token');
};

export const isAdminAuthenticated = () => {
  return !!getCookie('p2jmart_admin_token');
};


