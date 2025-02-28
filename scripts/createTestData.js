const admin = require('firebase-admin');
const faker = require('faker');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function createTestData() {
  try {
    console.log('Starting test data creation...');

    // Create 5 facilities
    const facilities = [];
    for (let i = 0; i < 5; i++) {
      const facilityData = {
        name: faker.company.companyName() + ' Medical Center',
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const facilityRef = await db.collection('facilities').add(facilityData);
      facilities.push(facilityRef.id);
      console.log(`Created facility: ${facilityData.name}`);
    }

    // Create 5 doctors with unique credentials
    for (let i = 0; i < 5; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email(firstName, lastName).toLowerCase();
      
      // Create user account
      const userData = {
        email,
        name: `${firstName} ${lastName}`,
        role: 'doctor',
        specialization: faker.name.jobArea(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const userRef = await db.collection('users').add(userData);
      
      // Assign doctor to a unique facility
      const facilityId = facilities[i];
      await db.collection('user_facilities').doc(userRef.id).set({
        userId: userRef.id,
        facilities: [facilityId],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Created doctor: ${userData.name} and assigned to facility`);
    }

    console.log('Successfully created test data!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

// Run the creation
createTestData(); 