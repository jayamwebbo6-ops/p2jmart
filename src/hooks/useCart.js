import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '../components/toast';
import { isUserAuthenticated } from '../api/userApi';
import { fetchCart, addCartItem, updateCartItem, removeCartItem, clearCart, clearCartState } from '../redux/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items || []);
  const [localCart, setLocalCart] = useState(cart);

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  useEffect(() => {
    if (isUserAuthenticated()) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  useEffect(() => {
    const onLoginStateChange = () => {
      if (isUserAuthenticated()) {
        dispatch(fetchCart());
      } else {
        dispatch(clearCartState());
      }
    };

    window.addEventListener('userLoginStateChange', onLoginStateChange);
    return () => window.removeEventListener('userLoginStateChange', onLoginStateChange);
  }, [dispatch]);

  const addToCart = async (product) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before adding items to cart.');
      return;
    }

    const productId = product.id || product._id || product.productId;
    const payload = {
      productId,
      title: product.title || product.name || 'Product',
      price: Number(product.price ?? 0),
      quantity: product.quantity || 1,
      image: product.image || (product.images && product.images[0]) || '',
      selectedOptions: product.selectedOptions || {},
      isComboProduct: Boolean(product.isComboProduct),
      includedProducts: product.includedProducts || [],
      weight: Number(product.weight || 0),
      category: typeof product.category === 'object'
        ? (product.category.name || product.category.title || product.category.id || 'Catalog')
        : (product.category || 'Catalog')
    };

    try {
      await dispatch(addCartItem(payload)).unwrap();
      toast.success(`"${payload.title}" added to Cart!`);
    } catch (error) {
      toast.error(error || 'Unable to add product to cart.');
    }
  };

  const updateQuantity = (id, amount) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    const existingItem = cart.find((item) => item.id === id || item._id === id);
    if (!existingItem) return;

    const nextQty = Math.max(1, (existingItem.quantity || 1) + amount);
    dispatch(updateCartItem({ itemId: existingItem.id || existingItem._id, payload: { quantity: nextQty } }));
  };

  const removeFromCart = (id) => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    if (!id) return;
    dispatch(removeCartItem(id));
  };

  const clearCartItems = async () => {
    if (!isUserAuthenticated()) {
      toast.info('Please login before updating your cart.');
      return;
    }

    try {
      await dispatch(clearCart()).unwrap();
      toast.success('All cart items have been removed.');
    } catch (error) {
      toast.error(error || 'Unable to clear cart.');
    }
  };

  return {
    cart,
    localCart,
    setLocalCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartItems
  };
};
