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

// Cancel an order
export const cancelOrderAPI = async (id) => {
  const response = await userApi.put(`/orders/cancel-order/${id}`);
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

// Admin: Approve or Reject a return request
export const adminReviewReturnAPI = async (orderId, itemId, action) => {
  const response = await api.put(`/orders/${orderId}/items/${itemId}/admin/review-return`, { action });
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

// Admin: Get all return requests
export const adminGetReturnRequestsAPI = async () => {
  const response = await api.get('/orders/admin/return-requests');
  return response.data;
};



