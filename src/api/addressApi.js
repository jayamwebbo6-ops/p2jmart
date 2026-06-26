import axios from 'axios';
import { getCookie } from './api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const addressApi = axios.create({
  baseURL: API_URL
});

addressApi.interceptors.request.use(
  (config) => {
    const token = getCookie('p2jmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const createAddressAPI = async (addressData) => {
  const response = await addressApi.post('/addresses/create-address', addressData);
  return response.data;
};

export const getMyAddressesAPI = async () => {
  const response = await addressApi.get('/addresses/get-my-addresses');
  return response.data;
};

export const updateAddressAPI = async (id, addressData) => {
  const response = await addressApi.put(`/addresses/update-address/${id}`, addressData);
  return response.data;
};

export const deleteAddressAPI = async (id) => {
  const response = await addressApi.delete(`/addresses/delete-address/${id}`);
  return response.data;
};

export const setDefaultAddressAPI = async (id) => {
  const response = await addressApi.put(`/addresses/set-default/${id}`);
  return response.data;
};
