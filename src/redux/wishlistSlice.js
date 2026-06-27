import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getWishlistAPI,
  addToWishlistAPI,
  removeFromWishlistAPI,
  clearWishlistAPI
} from '../api/wishlistApi';

// Helper to normalize product objects from backend for standard frontend usage
const normalizeWishlistItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean).map(item => {
    const id = item._id || item.id;
    
    // Resolve display image from top-level or variants
    let resolvedImage = '';
    if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
      resolvedImage = item.image;
    } else if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
      resolvedImage = item.images[0];
    } else if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const firstVar = item.variants[0];
      if (firstVar) {
        if (firstVar.images && Array.isArray(firstVar.images) && firstVar.images.length > 0 && firstVar.images[0]) {
          resolvedImage = firstVar.images[0];
        } else if (firstVar.image) {
          resolvedImage = firstVar.image;
        }
      }
    }

    return {
      ...item,
      id: id ? id.toString() : '',
      _id: id ? id.toString() : '',
      title: item.title || item.name || '',
      price: Number(item.price || 0),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      discount: Number(item.discount || 0),
      rating: Number(item.rating ?? 5),
      reviews: Number(item.reviews || 0),
      image: resolvedImage,
      images: item.images || []
    };
  });
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWishlistAPI();
      return normalizeWishlistItems(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to load wishlist');
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await addToWishlistAPI(productId);
      return normalizeWishlistItems(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to add to wishlist');
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await removeFromWishlistAPI(productId);
      return normalizeWishlistItems(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await clearWishlistAPI();
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Unable to clear wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearWishlistState(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Add Wishlist Item
      .addCase(addWishlistItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Remove Wishlist Item
      .addCase(removeWishlistItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
