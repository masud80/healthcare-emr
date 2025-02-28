import { lazy } from 'react';

// Lazy load messaging components
const MessagingDashboard = lazy(() => import('../components/messaging/MessagingDashboard'));
const ThreadDetails = lazy(() => import('../components/messaging/ThreadDetails'));
const CreateThread = lazy(() => import('../components/messaging/CreateThread'));

// Messaging module configuration
export const messagingModule = {
  name: 'Secure Messaging',
  routes: [
    {
      path: '/messaging',
      element: MessagingDashboard,
      roles: ['admin', 'doctor', 'nurse'],
      navigation: {
        icon: 'Message',
        label: 'Secure Messaging',
        order: 75
      }
    },
    {
      path: '/messaging/create',
      element: CreateThread,
      roles: ['admin', 'doctor', 'nurse'],
      navigation: false
    },
    {
      path: '/messaging/:threadId',
      element: ThreadDetails,
      roles: ['admin', 'doctor', 'nurse'],
      navigation: false
    }
  ],
  permissions: {
    create: ['admin', 'doctor', 'nurse'],
    read: ['admin', 'doctor', 'nurse'],
    update: ['admin', 'doctor', 'nurse'],
    delete: ['admin']
  }
};
