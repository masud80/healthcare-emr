import { configureStore } from '@reduxjs/toolkit';
import billingReducer from './slices/billingSlice';
import authReducer from './slices/authSlice';
import facilitiesReducer from './slices/facilitiesSlice';
import patientsReducer from './slices/patientsSlice';
import visitsReducer from './slices/visitsSlice';
import auditReducer from './slices/auditSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import prescriptionsReducer from './slices/prescriptionsSlice';
import pharmacyReducer from './slices/pharmacySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    facilities: facilitiesReducer,
    patients: patientsReducer,
    visits: visitsReducer,
    audit: auditReducer,
    appointments: appointmentsReducer,
    prescriptions: prescriptionsReducer,
    pharmacy: pharmacyReducer,
    billing: billingReducer
  }
});

export default store;
