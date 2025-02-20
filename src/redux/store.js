import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import facilitiesReducer from './slices/facilitiesSlice';
import patientsReducer from './slices/patientsSlice';
import visitsReducer from './slices/visitsSlice';
import auditReducer from './slices/auditSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import prescriptionsReducer from './slices/prescriptionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    facilities: facilitiesReducer,
    patients: patientsReducer,
    visits: visitsReducer,
    audit: auditReducer,
    appointments: appointmentsReducer,
    prescriptions: prescriptionsReducer
  }
});

export default store;
