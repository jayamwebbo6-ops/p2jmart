import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from './api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const userApi = axios.create({
  baseURL: API_URL
});

// Interceptor to inject User Authorization Bearer token from cookies
userApi.interceptors.request.use(
  (config) => {
    const token = getCookie('p2jmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Google Login API call
export const googleLoginAPI = async (idToken) => {
  const response = await userApi.post('/user/google-login', { idToken });

  if (response.data?.success) {
    setCookie('p2jmart_token', response.data.token, 7);
    localStorage.setItem(
      'p2j_user_profile',
      JSON.stringify(response.data.data)
    );
  }

  return response.data;
};

// ==========================================
// NEW: Email OTP Login API Calls
// ==========================================

// Send OTP Request
export const sendOtpAPI = async (email) => {
  // Matches your base routing path structure: /api/user/send-otp
  const response = await userApi.post('/user/send-otp', { email });
  return response.data;
};

// Verify OTP Request
export const verifyOtpAPI = async (email, otp) => {
  const response = await userApi.post('/user/verify-otp', { email, otp });

  if (response.data?.success) {
    // Save authentication state identically to Google Login
    setCookie('p2jmart_token', response.data.token, 7);
    localStorage.setItem(
      'p2j_user_profile',
      JSON.stringify(response.data.data)
    );
  }

  return response.data;
};

// ==========================================

// Fetch User Profile
export const getUserProfile = async () => {
  const response = await userApi.get('/user/profile');
  return response.data;
};

// Update User Profile
export const updateUserProfile = async (profileData) => {
  const response = await userApi.put('/user/profile', profileData);

  if (response.data?.success) {
    localStorage.setItem(
      'p2j_user_profile',
      JSON.stringify(response.data.data)
    );
    window.dispatchEvent(new Event('userLoginStateChange'));
  }

  return response.data;
};




export const submitContactFormAPI = async (contactData) => {
  const response = await userApi.post('/contact-us', contactData);
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

export default userApi;