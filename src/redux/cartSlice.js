import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartAPI,
  addCartItemAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI
} from '../api/cartApi';

const normalizeResponseData = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return payload;
};

const getCartItemsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return null;
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCartAPI();
      if (!response.success) {
        return rejectWithValue(response.message || 'Unable to load cart');
      }
      return normalizeResponseData(response.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to load cart');
    }
  }
);

export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async (item, { rejectWithValue }) => {
    try {
      const response = await addCartItemAPI(item);
      if (!response.success) {
        return rejectWithValue(response.message || 'Unable to add item to cart');
      }
      return normalizeResponseData(response.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, payload }, { rejectWithValue }) => {
    try {
      const response = await updateCartItemAPI(itemId, payload);
      if (!response.success) {
        return rejectWithValue(response.message || 'Unable to update cart item');
      }
      return normalizeResponseData(response.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to update cart item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await removeCartItemAPI(itemId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Unable to remove cart item');
      }
      return normalizeResponseData(response.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to remove cart item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearCartAPI();
      if (!response.success) {
        return rejectWithValue(response.message || 'Unable to clear cart');
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearCartState(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = getCartItemsFromPayload(action.payload) ?? [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCartItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const items = getCartItemsFromPayload(action.payload);
        if (items) state.items = items;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const items = getCartItemsFromPayload(action.payload);
        if (items) state.items = items;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(removeCartItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const items = getCartItemsFromPayload(action.payload);
        if (items) {
          state.items = items;
        } else if (action.meta?.arg) {
          state.items = state.items.filter(
            (item) => item.id !== action.meta.arg && item._id !== action.meta.arg
          );
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
