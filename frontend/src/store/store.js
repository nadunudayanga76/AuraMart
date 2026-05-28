import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    notification: notificationReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
