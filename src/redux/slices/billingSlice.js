import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  emailStatus: {
    sending: false,
    error: null
  },
  filters: {
    dateRange: {
      start: null,
      end: null
    },
    status: 'all'
  }
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setBills: (state, action) => {
      state.bills = action.payload;
      state.error = null;
    },
    setCurrentBill: (state, action) => {
      state.currentBill = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addBill: (state, action) => {
      state.bills.unshift(action.payload);
      state.error = null;
    },
    updateBill: (state, action) => {
      const index = state.bills.findIndex(bill => bill.id === action.payload.id);
      if (index !== -1) {
        state.bills[index] = action.payload;
      }
      if (state.currentBill?.id === action.payload.id) {
        state.currentBill = action.payload;
      }
      state.error = null;
    },
    emailBillStart: (state) => {
      state.emailStatus.sending = true;
      state.emailStatus.error = null;
    },
    emailBillSuccess: (state) => {
      state.emailStatus.sending = false;
      state.emailStatus.error = null;
    },
  emailBillFailure: (state, action) => {
      state.emailStatus.sending = false;
      state.emailStatus.error = action.payload;
    },
  setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const {
  setBills,
  setCurrentBill,
  setLoading,
  setError,
  addBill,
  updateBill,
  emailBillStart,
  emailBillSuccess,
  emailBillFailure,
  setFilters
} = billingSlice.actions;

export default billingSlice.reducer;
