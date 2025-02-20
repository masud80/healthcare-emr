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
    setUser: {
      reducer(state, action) {
        if (action.payload) {
          const { uid, email, role } = action.payload;
          state.user = { uid, email };
          state.role = role;
        } else {
          state.user = null;
          state.role = null;
        }
      },
      prepare(userData) {
        return {
          payload: userData ? {
            uid: userData.uid,
            email: userData.email,
            role: userData.role
          } : null
        };
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.role = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectRole = (state) => state.auth.role;

export default authSlice.reducer;
