import api from './api'; // Import your custom axios configuration instance
import userApi from './userApi';

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

// 🌟 Post a product review safely through your initialized API module instance

export const addProductReviewAPI = async (reviewData) => {
  const response = await userApi.post('/reviews/add', reviewData);
  return response.data;
};


export const editProductReviewAPI = async (reviewData) => {
  const response = await userApi.put('/reviews/edit', reviewData);
  return response.data;
};

export const deleteProductReviewAPI = async ({ productId, orderId, orderItemId, isCombo = false }) => {
  const response = await userApi.delete('/reviews/delete', {
    data: {
      productId,
      orderId,
      orderItemId,
      isCombo
    }
  });
  return response.data;
};

export const getProductReviewsAPI = async (productId, orderId, orderItemId, isCombo = false) => {
  const response = await userApi.get(`/reviews/${productId}`, {
    params: {
      orderId,
      orderItemId,
      isCombo
    }
  });
  return response.data;
};