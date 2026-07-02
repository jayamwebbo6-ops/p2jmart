import api from './api';

export const createCouponAPI = async (couponData) => {
  const response = await api.post('/coupons/create', couponData);
  return response.data;
};

export const getAllCouponsAPI = async () => {
  const response = await api.get('/coupons/getAll');
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
  const response = await api.post('/coupons/apply', couponDetails);
  return response.data;
};
