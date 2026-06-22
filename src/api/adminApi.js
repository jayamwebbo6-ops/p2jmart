import api, { setCookie, getCookie, deleteCookie } from './api';

// Admin Login
export const adminLogin = async (username, password) => {
  const response = await api.post('/api/admin/login', { username, password });
  if (response.data && response.data.success) {
    // Store token in cookie 'p2jmart_admin_token' for 1 day
    setCookie('p2jmart_admin_token', response.data.token, 1);
  }
  return response.data;
};

// Fetch Admin Profile
export const getAdminProfile = async () => {
  const response = await api.get('/api/admin/profile');
  return response.data;
};

// Update Admin Profile
export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/api/admin/profile', profileData);
  return response.data;
};

// Admin Logout
export const adminLogout = () => {
  deleteCookie('p2jmart_admin_token');
};

// Check if Authenticated (Token exists in cookies)
export const isAdminAuthenticated = () => {
  return !!getCookie('p2jmart_admin_token');
};

