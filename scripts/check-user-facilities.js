const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUserFacilities() {
  try {
    // Get a sample document from user_facilities
    const snapshot = await db.collection('user_facilities').limit(1).get();
    
    if (snapshot.empty) {
      console.log('No documents found in user_facilities collection');
      return;
    }

    // Log the first document's data structure
    const doc = snapshot.docs[0];
    console.log('Document data:', doc.data());
    console.log('Document fields:', Object.keys(doc.data()));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

checkUserFacilities();
