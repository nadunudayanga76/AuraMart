import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        time: new Date().toISOString(),
        ...action.payload,
      });
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
});

export const { addNotification, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
