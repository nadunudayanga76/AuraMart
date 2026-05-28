import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: 'Stripe',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const cartItemId = item.cartItemId || `${item._id}-${item.selectedColor || ''}-${item.selectedSize || ''}`;
      const existItem = state.cartItems.find((x) => (x.cartItemId || `${x._id}-${x.selectedColor || ''}-${x.selectedSize || ''}`) === cartItemId);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          (x.cartItemId || `${x._id}-${x.selectedColor || ''}-${x.selectedSize || ''}`) === cartItemId ? { ...item, cartItemId } : x
        );
      } else {
        state.cartItems = [...state.cartItems, { ...item, cartItemId }];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.cartItems = state.cartItems.filter((x) => (x.cartItemId || x._id) !== idToRemove);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(state.paymentMethod));
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;
