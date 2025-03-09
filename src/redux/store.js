// AI WARNING: This file is critical. Do not remove or mdoify without consulting human reviewer

import { configureStore } from '@reduxjs/toolkit';
import messagingReducer from './slices/messagingSlice';
import billingReducer from './slices/billingSlice';
import authReducer from './slices/authSlice';
import facilitiesReducer from './slices/facilitiesSlice';
import patientsReducer from './slices/patientsSlice';
import visitsReducer from './slices/visitsSlice';
import auditReducer from './slices/auditSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import prescriptionsReducer from './slices/prescriptionsSlice';
import pharmacyReducer from './slices/pharmacySlice';
import usersReducer from './slices/usersSlice';
import inventoryReducer from './slices/inventorySlice';

export const store = configureStore({
  reducer: {
    messaging: messagingReducer,
    auth: authReducer,
    facilities: facilitiesReducer,
    patients: patientsReducer,
    visits: visitsReducer,
    audit: auditReducer,
    appointments: appointmentsReducer,
    prescriptions: prescriptionsReducer,
    pharmacy: pharmacyReducer,
    billing: billingReducer,
    users: usersReducer,
    inventory: inventoryReducer
  }
});

export default store;
