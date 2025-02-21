const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const billId = '8RWNPj9kVbIUTyxCaNGJ';

async function verifyBill() {
  try {
    // Get the bill
    const billDoc = await admin.firestore().collection('bills').doc(billId).get();
    
    if (!billDoc.exists) {
      console.log('Bill not found');
      return;
    }

    const billData = billDoc.data();
    console.log('Bill Data:', billData);
    
    // Get facility info if facilityId exists
    if (billData.facilityId) {
      const facilityDoc = await admin.firestore().collection('facilities').doc(billData.facilityId).get();
      if (facilityDoc.exists) {
        console.log('Facility Data:', facilityDoc.data());
      } else {
        console.log('Facility not found');
      }
    } else {
      console.log('No facility ID associated with this bill');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

verifyBill();
