import api from './api';

// Fetch all products with optional filters
export const getProductsAPI = async (params = {}) => {
  const response = await api.get('/api/products', { params });
  return response.data;
};

// Fetch single product by ID
export const getProductByIdAPI = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

// Create a new product
export const createProductAPI = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

// Update an existing product
export const updateProductAPI = async (id, productData) => {
  const response = await api.put(`/api/products/${id}`, productData);
  return response.data;
};

// Delete a product
export const deleteProductAPI = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};
