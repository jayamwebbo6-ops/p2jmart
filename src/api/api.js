import axios from 'axios';

// Helper: Get a cookie by name
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper: Set a cookie
export const setCookie = (name, value, days = 1) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
};

// Helper: Delete a cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
};

export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL
});

// Interceptor to inject Authorization Bearer token from cookies and prevent GET caching
api.interceptors.request.use(
  (config) => {
    const token = getCookie('p2jmart_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting query parameter for all GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
