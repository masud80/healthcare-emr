import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientsReducer from './slices/patientsSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import facilitiesReducer from './slices/facilitiesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    facilities: facilitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
});

export default store;
