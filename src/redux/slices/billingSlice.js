import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    dateRange: null,
    patientId: null
  }
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setBills: (state, action) => {
      state.bills = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentBill: (state, action) => {
      state.currentBill = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addBill: (state, action) => {
      state.bills.push(action.payload);
    },
    updateBill: (state, action) => {
      const index = state.bills.findIndex(bill => bill.id === action.payload.id);
      if (index !== -1) {
        state.bills[index] = action.payload;
      }
    },
    clearBillingState: (state) => {
      return initialState;
    }
  }
});

export const {
  setBills,
  setCurrentBill,
  setLoading,
  setError,
  setFilters,
  addBill,
  updateBill,
  clearBillingState
} = billingSlice.actions;

export default billingSlice.reducer;
