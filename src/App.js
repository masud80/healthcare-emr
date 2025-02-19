import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './redux/store';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientDetails from './components/patients/PatientDetails';
import PatientForm from './components/patients/PatientForm';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentDetails from './components/appointments/AppointmentDetails';
import FacilityList from './components/facilities/FacilityList';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './components/auth/PrivateRoute';
import DatabaseInitializer from './components/utils/DatabaseInitializer';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
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
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:id" element={<PatientDetails />} />
                <Route path="patients/new" element={<PatientForm />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="facilities" element={<FacilityList />} />
                <Route path="database-init" element={<DatabaseInitializer />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<PrivateRoute requireAdmin={true} />}>
                <Route path="admin/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
