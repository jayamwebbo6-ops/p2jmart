import api from './api';

// Fetch all products with optional filters
export const getProductsAPI = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Fetch single product by ID
export const getProductByIdAPI = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create a new product
export const createProductAPI = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update an existing product
export const updateProductAPI = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete a product
export const deleteProductAPI = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Toggle product status (active/inactive)
export const toggleProductStatusAPI = async (id) => {
  const response = await api.patch(`/products/${id}/toggle-status`);
  return response.data;
};