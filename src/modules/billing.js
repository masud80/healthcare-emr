import { lazy } from 'react';

// Lazy load billing components
const BillingDashboard = lazy(() => import('../components/billing/BillingDashboard'));
const CreateBill = lazy(() => import('../components/billing/CreateBill'));
const BillDetails = lazy(() => import('../components/billing/BillDetails'));

// Billing module configuration
export const billingModule = {
  name: 'Billing',
  routes: [
    {
      path: '/billing',
      element: BillingDashboard,
      roles: ['admin', 'billing'],
      navigation: {
        icon: 'AccountBalance',
        label: 'Billing',
        order: 70 // Position in navigation menu
      }
    },
    {
      path: '/billing/create',
      element: CreateBill,
      roles: ['admin', 'billing'],
      navigation: false // Don't show in navigation menu
    },
    {
      path: '/billing/:billId',
      element: BillDetails,
      roles: ['admin', 'billing', 'doctor', 'nurse'],
      navigation: false
    }
  ],
  permissions: {
    create: ['admin', 'billing'],
    read: ['admin', 'billing', 'doctor', 'nurse'],
    update: ['admin', 'billing'],
    delete: ['admin']
  },
  // Redux integration
  reducers: {
    billing: require('../redux/slices/billingSlice').default
  },
  // Firestore collection configuration
  firestore: {
    collection: 'bills',
    indexes: [
      {
        fields: ['patientId', 'createdAt'],
        order: ['asc', 'desc']
      },
      {
        fields: ['status', 'createdAt'],
        order: ['asc', 'desc']
      },
      {
        fields: ['facilityId', 'createdAt'],
        order: ['asc', 'desc']
      }
    ]
  },
  // Module initialization
  initialize: async (store) => {
    // Any initialization logic for the billing module
    // For example, loading initial data, setting up listeners, etc.
    try {
      const { fetchBills } = require('../redux/thunks/billingThunks');
      await store.dispatch(fetchBills());
    } catch (error) {
      console.error('Error initializing billing module:', error);
    }
  },
  // Module cleanup
  cleanup: () => {
    // Any cleanup logic when the module is unloaded
    // For example, removing listeners, clearing cache, etc.
  }
};

// Export individual components for direct use
export { BillingDashboard, CreateBill, BillDetails };

// Export the module as default
export default billingModule;
