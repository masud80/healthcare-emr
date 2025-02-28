import * as admin from 'firebase-admin';
import { externalApi } from './api';
import { sendPatientRegistrationEmail } from './SendPatientRegistrationLink';
import { sendBillEmail } from './billing';
import { analyzePatient } from './ai';
import { createUser } from './createUser';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export the external API (accessible via /external/...)
export const api = externalApi;

// Export internal callable functions (protected by Firebase Auth)
export {
  sendPatientRegistrationEmail,
  sendBillEmail,
  analyzePatient,
  createUser
};



