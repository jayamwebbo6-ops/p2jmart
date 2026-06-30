import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '../components/toast';
import { isUserAuthenticated } from '../api/userApi';
import { fetchWishlist, addWishlistItem, removeWishlistItem, clearWishlistState } from '../redux/wishlistSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items || []);

  useEffect(() => {
    if (isUserAuthenticated()) {
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  useEffect(() => {
    const onLoginStateChange = () => {
      if (isUserAuthenticated()) {
        dispatch(fetchWishlist());
      } else {
        dispatch(clearWishlistState());
      }
    };

    window.addEventListener('userLoginStateChange', onLoginStateChange);
    return () => window.removeEventListener('userLoginStateChange', onLoginStateChange);
  }, [dispatch]);

  const addToWishlist = async (product) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before adding items to wishlist.');
      return;
    }
    const productId = product.id || product._id || product.productId;
    if (!productId) return;

    try {
      await dispatch(addWishlistItem(productId)).unwrap();
      toast.success(`"${product.title || 'Product'}" added to Wishlist!`);
    } catch (error) {
      toast.error(error || 'Unable to add item to wishlist.');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before removing items from wishlist.');
      return;
    }
    if (!productId) return;

    try {
      await dispatch(removeWishlistItem(productId)).unwrap();
      toast.info('Item removed from Wishlist.');
    } catch (error) {
      toast.error(error || 'Unable to remove item from wishlist.');
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist
  };
};
