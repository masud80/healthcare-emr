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
        const { uid, email } = action.payload;
        state.user = { uid, email };
      } else {
        state.user = null;
      }
    },
    setRole: (state, action) => {
      state.role = action.payload;
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

export const { setUser, setRole, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
