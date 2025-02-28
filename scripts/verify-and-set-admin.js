const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const verifyAndSetAdmin = async () => {
  try {
    const email = 'admin@healthcare.com';
    
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);
    
    // Get current custom claims
    const currentClaims = userRecord.customClaims || {};
    console.log('Current custom claims:', currentClaims);
    
    // Get Firestore user document
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    console.log('Current Firestore data:', userDoc.data());
    
    // Set admin custom claim if not already set
    if (!currentClaims.admin) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('Set admin custom claim');
    }
    
    // Update Firestore user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      name: 'Admin User'
    }, { merge: true });
    console.log('Updated Firestore user document');
    
    // Verify the changes
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('Updated custom claims:', updatedUser.customClaims);
    
    const updatedDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    console.log('Updated Firestore data:', updatedDoc.data());
    
  } catch (error) {
    console.error('Error:', error);
  }
};

verifyAndSetAdmin(); 