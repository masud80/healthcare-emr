const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Initialize Firebase
const app = initializeApp({
  projectId: "quantumleap-emr-dev"
});

const db = getFirestore(app);
const functions = getFunctions(app);

const testAI = async () => {
  try {
    // First get a patient ID
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);
    if (querySnapshot.empty) {
      console.log('No patients found');
      return;
    }
    
    const patientId = querySnapshot.docs[0].id;
    console.log('Testing AI analysis with patient ID:', patientId);

    // Call the AI analysis function
    const analyzePatientData = httpsCallable(functions, 'analyzePatientData');
    const result = await analyzePatientData({ patientId });
    
    console.log('AI Analysis Result:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testAI();
