import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import productsSlice from './productsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    products: productsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

