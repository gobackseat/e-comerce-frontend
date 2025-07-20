import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import cartSlice from './slices/cartSlice';
import adminSlice from './slices/adminSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [apiSlice.reducerPath]: apiSlice.reducer,

    // Feature slices
    auth: authSlice,
    ui: uiSlice,
    cart: cartSlice,
    admin: adminSlice,
  },

  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }).concat(apiSlice.middleware),

  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export default store;

// For TypeScript support (if needed later)
export const selectAuth = (state) => state.auth;
export const selectUI = (state) => state.ui;
export const selectCart = (state) => state.cart;
export const selectAdmin = (state) => state.admin;

// Store persistence configuration
export const persistConfig = {
  key: 'root',
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
  blacklist: ['ui', 'admin', 'api'], // Don't persist UI state and API cache
};

// Helper function to reset store (useful for logout)
export const resetStore = () => {
  store.dispatch({ type: 'RESET' });
};
