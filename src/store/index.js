import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import productsSlice from './slices/productsSlice.js';
import cartSlice from './slices/cartSlice.js';
import uiSlice from './slices/uiSlice.js';

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productsSlice,
    cart: cartSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date/function serialization
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});