import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Only store serializable user data
      if (action.payload) {
        const { uid, email, role } = action.payload;
        state.user = { uid, email };
        state.role = role; // Set role when setting user
      } else {
        state.user = null;
        state.role = null; // Clear role when clearing user
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectRole = (state) => state.auth.role;

export default authSlice.reducer;
