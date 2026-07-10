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

// Logging Interceptor Setup helper
export const setupLoggingInterceptors = (axiosInstance, name = 'API') => {
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log(
        `%c[${name} Request] ${config.method.toUpperCase()} ${config.url}`,
        'color: #007bff; font-weight: bold;',
        {
          params: config.params,
          data: config.data,
          headers: config.headers
        }
      );
      return config;
    },
    (error) => {
      console.error(
        `%c[${name} Request Error]`,
        'color: #dc3545; font-weight: bold;',
        error
      );
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(
        `%c[${name} Response] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`,
        'color: #28a745; font-weight: bold;',
        {
          data: response.data,
          status: response.status
        }
      );
      return response;
    },
    (error) => {
      const status = error.response ? error.response.status : 'NETWORK_ERROR';
      console.error(
        `%c[${name} Response Error] ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url || ''} - ${status}`,
        'color: #dc3545; font-weight: bold;',
        {
          message: error.message,
          response: error.response?.data
        }
      );
      return Promise.reject(error);
    }
  );
};

// Enable logging for default admin API instance
setupLoggingInterceptors(api, 'AdminAPI');

export default api;
