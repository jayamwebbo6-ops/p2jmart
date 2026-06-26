// Fetch Home CMS Configurations
import api from './api';

export const getHomeCMS = async () => {
  const response = await api.get('/home-cms');
  return response.data;
};

// Update Home CMS Configurations
export const updateHomeCMS = async (cmsData) => {
  const response = await api.post('/home-cms', cmsData);
  return response.data;
};