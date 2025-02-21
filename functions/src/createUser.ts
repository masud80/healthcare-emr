import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'facility_admin' | 'doctor' | 'nurse' | 'user';
}

interface UserDocument {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: admin.firestore.Timestamp;
}

export const createUser = functions.https.onCall(async (request: functions.https.CallableRequest<CreateUserData>) => {
  // Check if the caller is an admin
  if (!request.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can create new users'
    );
  }

  try {
    const data = request.data;
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name
    });

    // Create the user document in Firestore
    const userDoc: UserDocument = {
      uid: userRecord.uid,
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: admin.firestore.Timestamp.now()
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc);

    return { uid: userRecord.uid };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
});
