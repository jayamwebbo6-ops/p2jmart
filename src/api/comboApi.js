import api from './api';

// Fetch all combo packs
export const getCombosAPI = async () => {
  const response = await api.get('/combos');
  return response.data;
};

// Create a new combo pack
export const createComboAPI = async (comboData) => {
  const response = await api.post('/combos', comboData);
  return response.data;
};

// Update an existing combo pack
export const updateComboAPI = async (id, comboData) => {
  const response = await api.put(`/combos/${id}`, comboData);
  return response.data;
};

// Delete a combo pack
export const deleteComboAPI = async (id) => {
  const response = await api.delete(`/combos/${id}`);
  return response.data;
};

// Toggle combo status (active/inactive)
export const toggleComboStatusAPI = async (id) => {
  const response = await api.patch(`/combos/${id}/toggle-status`);
  return response.data;
};
