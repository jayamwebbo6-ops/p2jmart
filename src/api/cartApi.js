import userApi from './userApi';

export const getCartAPI = async () => {
  const response = await userApi.get('/cart');
  return response.data;
};

export const addCartItemAPI = async (cartItem) => {
  const response = await userApi.post('/cart', cartItem);
  return response.data;
};

export const updateCartItemAPI = async (itemId, payload) => {
  const response = await userApi.put(`/cart/${itemId}`, payload);
  return response.data;
};

export const removeCartItemAPI = async (itemId) => {
  const response = await userApi.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCartAPI = async () => {
  const response = await userApi.delete('/cart');
  return response.data;
};
