import api from './api'; // Fetch Home CMS Configurations


export const getHomeCMS = async () => {
  const response = await api.get('/api/home-cms');
  return response.data;
};

// Update Home CMS Configurations
export const updateHomeCMS = async (cmsData) => {
  const response = await api.post('/api/home-cms', cmsData);
  return response.data;
};