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
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Patient Routes */}
                      <Route path="/patients" element={<PatientList />} />
                      <Route path="/patients/new" element={<PatientForm />} />
                      <Route path="/patients/:id" element={<PatientDetails />} />
                      <Route path="/patients/:id/edit" element={<PatientForm />} />
                      
                      {/* Appointment Routes */}
                      <Route path="/appointments" element={<AppointmentList />} />
                      <Route path="/appointments/new" element={<AppointmentDetails />} />
                      <Route path="/appointments/:id" element={<AppointmentDetails />} />
                      
                      {/* Admin Routes */}
                      <Route
                        path="/users"
                        element={
                          <PrivateRoute allowedRoles={['admin']}>
                            <UserManagement />
                          </PrivateRoute>
                        }
                      />
                      
                      <Route index element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
            
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
