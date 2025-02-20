import { createSlice } from '@reduxjs/toolkit';
import { fetchAuditLogs } from '../thunks/auditThunks';

const initialState = {
  logs: [],
  loading: false,
  error: null
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearLogs: (state) => {
      state.logs = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearLogs } = auditSlice.actions;
export default auditSlice.reducer;
