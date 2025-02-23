import accountReducer from './slices/accountSlice';

export const store = configureStore({
  reducer: {
    // ... other reducers
    account: accountReducer,
  },
});