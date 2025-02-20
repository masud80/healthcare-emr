require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// List of random first names and last names
const firstNames = [
  'Alexander', 'Benjamin', 'Christopher', 'Daniel', 'Elizabeth',
  'Gabriella', 'Harrison', 'Isabella', 'Jonathan', 'Katherine',
  'Leonardo', 'Margaret', 'Nicholas', 'Olivia', 'Patricia',
  'Quentin', 'Rebecca', 'Sebastian', 'Theodore', 'Victoria'
];

const lastNames = [
  'Anderson', 'Blackwood', 'Campbell', 'Davidson', 'Edwards',
  'Fitzgerald', 'Grayson', 'Hamilton', 'Isaacson', 'Johnson',
  'Kingston', 'Lancaster', 'Montgomery', 'Nicholson', 'O\'Connor',
  'Peterson', 'Richardson', 'Stevenson', 'Thompson', 'Williams'
];

// Function to get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Function to generate a unique full name
function generateUniqueName(usedNames) {
  let fullName;
  do {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    fullName = `${firstName} ${lastName}`;
  } while (usedNames.has(fullName));
  usedNames.add(fullName);
  return fullName;
}

async function updatePatients() {
  try {
    // Sign in as admin first
    await signInWithEmailAndPassword(auth, 'admin@healthcare.com', 'admin123');
    console.log('Successfully signed in as admin');

    // First, get all facilities
    const facilitiesRef = collection(db, 'facilities');
    const facilitiesSnapshot = await getDocs(facilitiesRef);
    const facilities = [];
    facilitiesSnapshot.forEach(doc => {
      facilities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`Found ${facilities.length} facilities`);

    // Then update patients
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);

    const usedNames = new Set();
    const updates = [];

    snapshot.forEach(docSnapshot => {
      const patient = docSnapshot.data();
      const newName = generateUniqueName(usedNames);
      const randomFacility = getRandomElement(facilities);
      
      console.log(`Updating patient ${patient.name} to ${newName} and assigning to facility: ${randomFacility.name}`);
      
      updates.push(updateDoc(doc(db, 'patients', docSnapshot.id), { 
        name: newName,
        facilityId: randomFacility.id,
        facilityName: randomFacility.name
      }));
    });

    await Promise.all(updates);
    console.log('Successfully updated patient names and facility assignments');
  } catch (error) {
    console.error('Error updating patients:', error);
  } finally {
    setTimeout(() => process.exit(), 1000);
  }
}

updatePatients();
