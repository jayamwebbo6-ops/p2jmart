import api, { setCookie, getCookie, deleteCookie } from './api';

// Admin Login
export const adminLogin = async (username, password) => {
  const response = await api.post('/admin/login', { username, password });

  if (response.data && response.data.success) {
    // Store token in cookie for 1 day
    setCookie('p2jmart_admin_token', response.data.token, 1);
  }

  return response.data;
};

// Fetch Admin Profile
export const getAdminProfile = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

// Fixed: Now using your centralized configured axios "api" instance
export const forgotPasswordApi = async (email) => {
  const response = await api.post('/admin/forgot-password', { email });
  return response.data; 
};

// Fixed: Now using your centralized configured axios "api" instance
export const resetPasswordApi = async (email, otp, newPassword) => {
  const response = await api.post('/admin/reset-password', { email, otp, newPassword });
  return response.data;
};

// Update Admin Profile
export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/admin/profile', profileData);
  return response.data;
};

// Admin Logout
export const adminLogout = () => {
  deleteCookie('p2jmart_admin_token');
};

// Check if Authenticated
export const isAdminAuthenticated = () => {
  return !!getCookie('p2jmart_admin_token');
};