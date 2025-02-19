const React = require('react');
const { render } = require('@testing-library/react');
const { Provider } = require('react-redux');
const { BrowserRouter } = require('react-router-dom');
const { configureStore } = require('@reduxjs/toolkit');
const { default: authReducer } = require('../../redux/slices/authSlice');
const { default: facilitiesReducer } = require('../../redux/slices/facilitiesSlice');
const { default: patientsReducer } = require('../../redux/slices/patientsSlice');

// Mock initial states
const initialAuthState = {
  user: { uid: 'testUserId', role: 'admin' },
  loading: false,
  error: null
};

const initialFacilitiesState = {
  facilities: [],
  loading: false,
  error: null
};

const initialPatientsState = {
  patients: [],
  loading: false,
  error: null
};

// Custom render function that includes Redux provider and Router
function renderWithProviders(
  ui,
  {
    preloadedState = {
      auth: initialAuthState,
      facilities: initialFacilitiesState,
      patients: initialPatientsState
    },
    store = configureStore({
      reducer: {
        auth: authReducer,
        facilities: facilitiesReducer,
        patients: patientsReducer
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
const mockFacility = {
  id: '1',
  name: 'Test Facility',
  address: '123 Test St',
  phone: '555-555-5555'
};

const mockPatient = {
  id: '1', 
  name: 'Test Patient',
  dateOfBirth: '1990-01-01',
  contact: '555-555-5555',
  medicalHistory: []
};

const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'doctor',
  facilities: []
};

module.exports = {
  renderWithProviders,
  mockFacility,
  mockPatient,
  mockUser,
  initialAuthState,
  initialFacilitiesState,
  initialPatientsState
};
