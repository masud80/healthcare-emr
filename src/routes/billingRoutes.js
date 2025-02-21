import React from 'react';
import { Route } from 'react-router-dom';
import BillingDashboard from '../components/billing/BillingDashboard';
import CreateBill from '../components/billing/CreateBill';
import BillDetails from '../components/billing/BillDetails';

const BillingRoutes = [
  {
    path: '/billing',
    element: <BillingDashboard />,
    roles: ['admin', 'billing', 'facility_admin']
  },
  {
    path: '/billing/create',
    element: <CreateBill />,
    roles: ['admin', 'billing', 'facility_admin']
  },
  {
    path: '/billing/:billId',
    element: <BillDetails />,
    roles: ['admin', 'billing', 'doctor', 'nurse']
  }
];

// Helper function to generate Route components
export const renderBillingRoutes = () => {
  return BillingRoutes.map(route => (
    <Route
      key={route.path}
      path={route.path}
      element={route.element}
    />
  ));
};

// Export routes configuration for use in role-based access control
export const getBillingRoutes = () => BillingRoutes;

export default BillingRoutes;
