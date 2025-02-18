import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientsReducer from './slices/patientsSlice';
import appointmentsReducer from './slices/appointmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['appointments/setSelectedAppointment'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.date'],
        // Ignore these paths in the state
        ignoredPaths: ['appointments.selectedAppointment.date'],
      },
    }),
});
