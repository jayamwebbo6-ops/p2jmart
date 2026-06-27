import userApi from './userApi';

// Get wishlist
export const getWishlistAPI = async () => {
  const response = await userApi.get('/wishlist');
  return response.data;
};

// Add product to wishlist
export const addToWishlistAPI = async (productId) => {
  const response = await userApi.post('/wishlist', {
    productId,
  });
  return response.data;
};

// Remove product from wishlist
export const removeFromWishlistAPI = async (productId) => {
  const response = await userApi.delete(`/wishlist/${productId}`);
  return response.data;
};

// Clear wishlist
export const clearWishlistAPI = async () => {
  const response = await userApi.delete('/wishlist');
  return response.data;
};