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
