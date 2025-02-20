import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/slices/authSlice';
import facilitiesReducer from '../../redux/slices/facilitiesSlice';
import patientsReducer from '../../redux/slices/patientsSlice';
import appointmentsReducer from '../../redux/slices/appointmentsSlice';

// Mock initial states
export const initialAuthState = {
  user: { uid: 'testUserId', email: 'test@example.com' },
  role: 'admin',
  loading: false,
  error: null
};

export const initialFacilitiesState = {
  facilities: [],
  loading: false,
  error: null
};

export const initialPatientsState = {
  patients: [],
  loading: false,
  error: null
};

export const initialAppointmentsState = {
  appointments: [],
  loading: false,
  error: null
};

// Custom render function that includes Redux provider and Router
export function renderWithProviders(
  ui,
  {
    preloadedState = {
      auth: initialAuthState,
      facilities: initialFacilitiesState,
      patients: initialPatientsState,
      appointments: initialAppointmentsState
    },
    store = configureStore({
      reducer: {
        auth: authReducer,
        facilities: facilitiesReducer,
        patients: patientsReducer,
        appointments: appointmentsReducer
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data
export const mockFacility = {
  id: '1',
  name: 'Test Facility',
  address: '123 Test St',
  phone: '555-555-5555'
};

export const mockPatient = {
  id: '1', 
  name: 'Test Patient',
  dateOfBirth: '1990-01-01',
  contact: '555-555-5555',
  medicalHistory: []
};

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'doctor',
  facilities: []
};
