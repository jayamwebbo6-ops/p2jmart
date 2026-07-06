import userApi from './userApi';

// Create a new CCAvenue payment session
export const createPaymentAPI = async (orderData) => {
  const response = await userApi.post('/payments/create', orderData);
  return response.data;
};

// Retrieve payment and order status by DB Order ID
export const getPaymentStatusAPI = async (orderId) => {
  const response = await userApi.get(`/payments/status/${orderId}`);
  return response.data;
};
