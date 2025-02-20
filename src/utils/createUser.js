const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const createUser = async (userData) => {
  try {
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name
    });

    // Create the user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date().toISOString()
    });

    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

module.exports = {
  createUser
};
