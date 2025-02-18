import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientsReducer from './slices/patientsSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import facilitiesReducer from './slices/facilitiesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    facilities: facilitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'appointments/setSelectedAppointment',
          'auth/setUser',
          'auth/setError',
          'facilities/setSelectedFacility'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.date',
          'payload.user',
          'payload.error'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'appointments.selectedAppointment.date',
          'auth.user',
          'facilities.selectedFacility'
        ],
      },
    }),
});
