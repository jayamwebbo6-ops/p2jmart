import api from './api';

// Fetch all attributes
export const getAttributesAPI = async () => {
  const response = await api.get('/api/attributes');
  return response.data;
};

// Create an attribute
export const createAttributeAPI = async (attrData) => {
  const response = await api.post('/api/attributes', attrData);
  return response.data;
};

// Update an attribute
export const updateAttributeAPI = async (id, attrData) => {
  const response = await api.put(`/api/attributes/${id}`, attrData);
  return response.data;
};

// Delete an attribute
export const deleteAttributeAPI = async (id) => {
  const response = await api.delete(`/api/attributes/${id}`);
  return response.data;
};
