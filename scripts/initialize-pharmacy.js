const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const samplePharmacies = [
  {
    name: "HealthCare Pharmacy",
    address: "123 Medical Center Blvd, Suite 100, Atlanta, GA 30303",
    phone: "(404) 555-0123",
    fax: "(404) 555-0124",
    email: "info@healthcarepharmacy.com",
    licenseNumber: "PHR123456",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Community Care Pharmacy",
    address: "456 Wellness Drive, Atlanta, GA 30308",
    phone: "(404) 555-0125",
    fax: "(404) 555-0126",
    email: "care@communitypharmacy.com",
    licenseNumber: "PHR789012",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "QuickMeds Pharmacy",
    address: "789 Hospital Street, Atlanta, GA 30312",
    phone: "(404) 555-0127",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function initializePharmacyCollection() {
  try {
    // Delete existing pharmacies
    const snapshot = await db.collection('pharmacies').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Existing pharmacies deleted');

    // Add sample pharmacies
    for (const pharmacy of samplePharmacies) {
      await db.collection('pharmacies').add(pharmacy);
    }
    console.log('Sample pharmacies added successfully');
  } catch (error) {
    console.error('Error initializing pharmacy collection:', error);
  }
}

initializePharmacyCollection()
  .then(() => {
    console.log('Pharmacy collection initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize pharmacy collection:', error);
    process.exit(1);
  });
