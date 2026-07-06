import api from './api';
import userApi from './userApi';

export const createCouponAPI = async (couponData) => {
  const response = await api.post('/coupons/create', couponData);
  return response.data;
};

export const getAllCouponsAPI = async () => {
  const response = await api.get('/coupons/getAll');
  return response.data;
};

export const getEligibleCouponsAPI = async () => {
  const response = await userApi.get('/coupons/get-eligible');
  return response.data;
};

export const updateCouponAPI = async (id, couponData) => {
  const response = await api.put(`/coupons/update/${id}`, couponData);
  return response.data;
};

export const toggleCouponStatusAPI = async (id) => {
  const response = await api.put(`/coupons/toggle-status/${id}`);
  return response.data;
};

export const deleteCouponAPI = async (id) => {
  const response = await api.delete(`/coupons/delete/${id}`);
  return response.data;
};

export const applyCouponAPI = async (couponDetails) => {
  const response = await userApi.post('/coupons/apply', couponDetails);
  return response.data;
};