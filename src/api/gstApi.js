import api from './api';

export const createGstAPI = async (gstData) => {
  const response = await api.post('/gst/create-gst', gstData);
  return response.data;
};

export const getAllGstAPI = async () => {
  const response = await api.get('/gst/getAll-gst');
  return response.data;
};

export const updateGstAPI = async (id, gstData) => {
  const response = await api.put(`/gst/update-gst/${id}`, gstData);
  return response.data;
};

export const deleteGstAPI = async (id) => {
  const response = await api.put(`/gst/delete-gst/${id}`);
  return response.data;
};