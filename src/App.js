import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DatabaseInitializer from './components/utils/DatabaseInitializer';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './redux/store';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientDetails from './components/patients/PatientDetails';
import PatientForm from './components/patients/PatientForm';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentDetails from './components/appointments/AppointmentDetails';
import UserManagement from './components/admin/UserManagement';
import FacilityList from './components/facilities/FacilityList';
import PrivateRoute from './components/auth/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <Navigate to="/dashboard" replace />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              
              {/* Patient Routes */}
              <Route
                path="/patients"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <PatientList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients/new"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <PatientForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients/:id"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <PatientDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients/:id/edit"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <PatientForm />
                  </PrivateRoute>
                }
              />
              
              {/* Appointment Routes */}
              <Route
                path="/appointments"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <AppointmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments/new"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <AppointmentDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments/:id"
                element={
                  <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                    <AppointmentDetails />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/users"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/facilities"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <FacilityList />
                  </PrivateRoute>
                }
              />
            </Route>
            
            <Route
              path="/unauthorized"
              element={
                <div style={{ padding: 20 }}>
                  You are not authorized to access this page.
                </div>
              }
            />
          </Routes>
        </Router>
        <DatabaseInitializer />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
