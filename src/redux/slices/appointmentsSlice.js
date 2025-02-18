import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
      state.error = null;
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
      state.error = null;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
      state.error = null;
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      if (state.selectedAppointment?.id === action.payload.id) {
        state.selectedAppointment = action.payload;
      }
      state.error = null;
    },
    deleteAppointment: (state, action) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
      if (state.selectedAppointment?.id === action.payload) {
        state.selectedAppointment = null;
      }
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAppointments,
  setSelectedAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setLoading,
  setError,
  clearError,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
