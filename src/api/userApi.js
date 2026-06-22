import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from './api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const userApi = axios.create({
  baseURL: API_URL
});

// Interceptor to inject User Authorization Bearer token from cookies (p2jmart_token)
userApi.interceptors.request.use(
  (config) => {
    const token = getCookie('p2jmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Google Login API call
export const googleLoginAPI = async (idToken) => {
  const response = await userApi.post('/api/user/google-login', { idToken });
  if (response.data && response.data.success) {
    setCookie('p2jmart_token', response.data.token, 7); // Store token for 7 days
    localStorage.setItem('p2j_user_profile', JSON.stringify(response.data.data));
  }
  return response.data;
};

// Fetch User Profile API call
export const getUserProfile = async () => {
  const response = await userApi.get('/api/user/profile');
  return response.data;
};

// Update User Profile API call
export const updateUserProfile = async (profileData) => {
  const response = await userApi.put('/api/user/profile', profileData);
  if (response.data && response.data.success) {
    localStorage.setItem('p2j_user_profile', JSON.stringify(response.data.data));
    window.dispatchEvent(new Event('userLoginStateChange'));
  }
  return response.data;
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  return !!getCookie('p2jmart_token');
};

// Logout User
export const userLogout = () => {
  deleteCookie('p2jmart_token');
  localStorage.removeItem('p2j_user_profile');
};
