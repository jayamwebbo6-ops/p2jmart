import api, { setCookie, getCookie, deleteCookie } from './api';

// Admin Login
export const adminLogin = async (username, password) => {
  const response = await api.post('/admin/login', { username, password });
  if (response.data && response.data.success) {
    setCookie('p2jmart_admin_token', response.data.token, 1);
  }
  return response.data;
};

// NEW: Fetch admin email configuration via the unauthenticated public endpoint
export const getAdminEmailPublic = async () => {
  const response = await api.get('/admin/get-email');
  return response.data;
};

// Fetch Admin Profile (Protected)
export const getAdminProfile = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post('/admin/forgot-password', { email });
  return response.data; 
};

export const resetPasswordApi = async (email, otp, newPassword) => {
  const response = await api.post('/admin/reset-password', { email, otp, newPassword });
  return response.data;
};

export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/admin/profile', profileData);
  return response.data;
};

export const adminLogout = () => {
  deleteCookie('p2jmart_admin_token');
};

export const isAdminAuthenticated = () => {
  return !!getCookie('p2jmart_admin_token');
};