import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from './components/layout/Layout';
import CreateVisit from './components/visits/CreateVisit';
import VisitList from './components/visits/VisitList';
import VisitDetails from './components/visits/VisitDetails';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientDetails from './components/patients/PatientDetails';
import PatientForm from './components/patients/PatientForm';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentDetails from './components/appointments/AppointmentDetails';
import CreateAppointment from './components/appointments/CreateAppointment';
import FacilityList from './components/facilities/FacilityList';
import FacilityDetails from './components/facilities/FacilityDetails';
import CreateFacility from './components/facilities/CreateFacility';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './components/auth/PrivateRoute';
import DatabaseInitializer from './components/utils/DatabaseInitializer';
import MedicalRecords from './components/records/MedicalRecords';
import AssignFacilityTest from './components/admin/AssignFacilityTest';
import AuditReport from './components/audit/AuditReport';
import './styles/components.css';

function App() {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                <Route path="patients/:patientId/visits" element={<VisitList />} />
                <Route path="patients/:patientId/visits/new" element={<CreateVisit />} />
                <Route path="patients/:patientId/visits/:visitId" element={<VisitDetails />} />
                <Route path="patients/new" element={<PatientForm />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="appointments/new" element={<CreateAppointment />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="facilities" element={<FacilityList />} />
                <Route element={<PrivateRoute requireFacilityAdmin={true} />}>
                  <Route path="facilities/new" element={<CreateFacility />} />
                </Route>
                <Route path="facilities/:id" element={<FacilityDetails />} />
                <Route path="records" element={<MedicalRecords />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<PrivateRoute requireAdmin={true} />}>
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/assign-facility" element={<AssignFacilityTest />} />
                <Route path="database-init" element={<DatabaseInitializer />} />
                <Route path="audit" element={<AuditReport />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </LocalizationProvider>
    </Provider>
  );
}

export default App;
