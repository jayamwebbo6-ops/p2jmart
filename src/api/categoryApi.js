import api from './api';

// Fetch all categories
export const getCategoriesAPI = async () => {
  const response = await api.get('/api/categories');
  return response.data;
};

// Create a category
export const createCategoryAPI = async (catData) => {
  const response = await api.post('/api/categories', catData);
  return response.data;
};

// Update a category
export const updateCategoryAPI = async (id, catData) => {
  const response = await api.put(`/api/categories/${id}`, catData);
  return response.data;
};

// Delete a category
export const deleteCategoryAPI = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};

// Create a subcategory
export const createSubcategoryAPI = async (subData) => {
  const response = await api.post('/api/categories/sub', subData);
  return response.data;
};

// Update a subcategory
export const updateSubcategoryAPI = async (id, subData) => {
  const response = await api.put(`/api/categories/sub/${id}`, subData);
  return response.data;
};

// Delete a subcategory
export const deleteSubcategoryAPI = async (id) => {
  const response = await api.delete(`/api/categories/sub/${id}`);
  return response.data;
};
