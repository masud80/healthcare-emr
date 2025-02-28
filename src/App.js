import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from './components/layout/Layout';
import ForgotPassword from './components/auth/ForgotPassword';
import BillingDashboard from './components/billing/BillingDashboard';
import BillDetails from './components/billing/BillDetails';
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
import FacilityBranding from './components/facilities/FacilityBranding';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './components/auth/PrivateRoute';
import PharmacyList from './components/pharmacy/PharmacyList';
import CreatePharmacy from './components/pharmacy/CreatePharmacy';
import DatabaseInitializer from './components/utils/DatabaseInitializer';
import MedicalRecords from './components/records/MedicalRecords';
import AssignFacilityTest from './components/admin/AssignFacilityTest';
import AuditReport from './components/audit/AuditReport';
import MyAccount from './components/account/MyAccount.jsx';
import MessagingDashboard from './components/messaging/MessagingDashboard';
import ThreadDetails from './components/messaging/ThreadDetails';
import CreateThread from './components/messaging/CreateThread';
import RolePermissions from './components/admin/RolePermissions';
import FacilityGroups from './components/admin/FacilityGroups';
import './styles/components.css';

function App() {
  console.log('App rendering...'); // Add this for debugging

  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Make login the default route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            
              {/* Update Patient Portal route to show a message or redirect */}
              <Route path="/patient/*" element={
                <Navigate to="/login" replace />
              } />
            
              <Route path="/" element={<Layout />}>
                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                  {/* Basic routes that any authenticated user can access */}
                  <Route path="dashboard" element={<Dashboard />} />
                
                  {/* Admin and Facility Admin routes */}
                  <Route element={<PrivateRoute requireAdmin={true} requireFacilityAdmin={true} />}>
                    <Route path="facilities" element={<FacilityList />} />
                    <Route path="facilities/:id" element={<FacilityDetails />} />
                    <Route path="facilities/branding" element={<FacilityBranding />} />
                    <Route path="admin/pharmacies" element={<PharmacyList />} />
                    <Route path="billing" element={<BillingDashboard />} />
                    <Route path="billing/:billId" element={<BillDetails />} />
                  </Route>

                  {/* Admin-only routes */}
                  <Route element={<PrivateRoute requireAdmin={true} />}>
                    <Route path="facilities/new" element={<CreateFacility />} />
                    <Route path="admin/users" element={<UserManagement />} />
                    <Route path="admin/role-permissions" element={<RolePermissions />} />
                    <Route path="admin/facility-groups" element={<FacilityGroups />} />
                    <Route path="admin/assign-facility" element={<AssignFacilityTest />} />
                    <Route path="database-init" element={<DatabaseInitializer />} />
                    <Route path="audit" element={<AuditReport />} />
                    <Route path="admin/pharmacies" element={<PharmacyList />} />
                    <Route path="admin/pharmacies/create" element={<CreatePharmacy />} />
                    <Route path="admin/pharmacies/:id/edit" element={<CreatePharmacy />} />
                    <Route path="admin/billing" element={<BillingDashboard />} />
                    <Route path="admin/billing/:billId" element={<BillDetails />} />
                  </Route>

                  {/* Other authenticated routes */}
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/:id" element={<PatientDetails />} />
                  <Route path="patients/:patientId/visits" element={<VisitList />} />
                  <Route path="patients/:patientId/visits/new" element={<CreateVisit />} />
                  <Route path="patients/:patientId/visits/:visitId" element={<VisitDetails />} />
                  <Route path="patients/new" element={<PatientForm />} />
                  <Route path="appointments" element={<AppointmentList />} />
                  <Route path="appointments/new" element={<CreateAppointment />} />
                  <Route path="appointments/:id" element={<AppointmentDetails />} />
                  <Route path="my-account" element={<MyAccount />} />
                  <Route path="records" element={<MedicalRecords />} />
                  <Route path="messaging" element={<MessagingDashboard />} />
                  <Route path="messaging/create" element={<CreateThread />} />
                  <Route path="messaging/:threadId" element={<ThreadDetails />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </LocalizationProvider>
    </Provider>
  );
}

export default App;
