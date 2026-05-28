import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch user wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo) return [];

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/wishlist`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Toggle wishlist item
export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo) throw new Error('Not logged in');

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/wishlist/${productId}`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.wishlistItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.wishlistItems = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
