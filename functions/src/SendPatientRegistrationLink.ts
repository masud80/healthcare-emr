import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp();
}

interface PatientRegistrationData {
  patientId: string;
  email: string;
  name: string;
}

export const sendPatientRegistrationEmail = functions.https.onCall({
    cors: [/localhost/]
  },
  async (request: functions.https.CallableRequest<PatientRegistrationData>) => {
    // Verify that the caller is an admin
    if (!request.auth?.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can send registration emails'
      );
    }

    const { email, name } = request.data;

    try {
      // Create user if they don't exist
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        if (!userRecord) {
            let newUser = await admin.auth().createUser({
                email: email,
                displayName: name,
                emailVerified: false
            });
            userRecord = newUser;
        }
      } catch (error) {
        // If user doesn't exist, create them
        let newUser = await admin.auth().createUser({
          email: email,
          displayName: name,
          emailVerified: false
        });
        userRecord = newUser;
      }

      // Generate password reset link
      if (!userRecord) {
        throw new functions.https.HttpsError(
          'internal',
          'Error creating user'
        );
      }
      
      const link = await admin.auth().generatePasswordResetLink(email);

      // Send email using your existing email service
      await admin.firestore().collection('mail').add({
        to: email,
        template: {
          name: 'patientRegistration',
          data: {
            patientName: name,
            resetLink: link
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending registration email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error sending registration email'
      );
    }
  }
); 