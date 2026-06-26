import api from './api';

export const createShippingAPI = async (shippingData) => {
  const response = await api.post('/shipping/create-shipping', shippingData);
  return response.data;
};

export const getAllShippingAPI = async () => {
  const response = await api.get('/shipping/getAll-shipping');
  return response.data;
};

export const updateShippingAPI = async (id, shippingData) => {
  const response = await api.put(`/shipping/update-shipping/${id}`, shippingData);
  return response.data;
};

export const deleteShippingAPI = async (id) => {
  const response = await api.delete(`/shipping/delete-shipping/${id}`);
  return response.data;
};
