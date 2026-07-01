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


// 1. Add/Update Review (Using your existing combined POST controller)
export const addProductReviewAPI = async (reviewData) => {
  // Expects reviewData to contain: { productId, rating, description }
  const response = await userApi.post('/reviews/add', reviewData);
  return response.data;
};

// 2. Edit Existing Review Explicitly (If using the split PUT controller)
export const editProductReviewAPI = async (reviewData) => {
  // Expects reviewData to contain: { productId, rating, description }
  const response = await userApi.put('/reviews/edit', reviewData);
  return response.data;
};

// 3. Delete Review
export const deleteProductReviewAPI = async (productId) => {
  // Sends the target product ID to clean up the review array
  const response = await userApi.delete('/reviews/delete', { 
    data: { productId } 
  });
  return response.data;
};

export const getProductReviewsAPI = async (productId) => {
  const response = await userApi.get(`/reviews/${productId}`);
  return response.data;
};