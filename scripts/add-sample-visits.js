const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample visit data generator
const generateVisitData = (patientId) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 30); // Random day in last 30 days
  const visitDate = new Date(now.setDate(now.getDate() - randomDays));

  return {
    patientId,
    createdAt: visitDate.toISOString(),
    vitals: {
      bloodPressure: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
      heartRate: (60 + Math.floor(Math.random() * 40)).toString(),
      temperature: (97.5 + Math.random() * 2).toFixed(1),
      respiratoryRate: (12 + Math.floor(Math.random() * 8)).toString(),
      oxygenSaturation: (95 + Math.floor(Math.random() * 5)).toString(),
      weight: (120 + Math.floor(Math.random() * 80)).toString(),
      height: (60 + Math.floor(Math.random() * 12)).toString(),
      bmi: (18.5 + Math.random() * 10).toFixed(1)
    },
    notes: {
      consultationNotes: "Patient visited for routine checkup. Vitals are within normal range.",
      progressNotes: "Patient showing good progress. No concerning symptoms reported.",
      nurseNotes: "Patient cooperative during examination. All measurements taken successfully.",
      soapNotes: {
        subjective: "Patient reports feeling well overall. No new complaints.",
        objective: "Physical examination reveals normal findings. Vitals stable.",
        assessment: "Healthy adult patient with stable vital signs.",
        plan: "Continue current health maintenance. Follow up as needed."
      }
    },
    symptoms: ["none"],
    actionPlan: "Maintain current health regimen. Schedule follow-up in 6 months.",
    provider: {
      id: "sample-provider",
      name: "Dr. Smith",
      role: "Primary Care Physician"
    }
  };
};

// Main function to add sample visits
const addSampleVisits = async () => {
  try {
    // Get all patients
    const patientsSnapshot = await db.collection('patients').get();
    
    console.log(`Found ${patientsSnapshot.size} patients. Adding sample visits...`);

    for (const patientDoc of patientsSnapshot.docs) {
      const patientId = patientDoc.id;
      
      // Add 3 sample visits for each patient
      for (let i = 0; i < 3; i++) {
        const visitData = generateVisitData(patientId);
        await db.collection('visits').add(visitData);
        console.log(`Added visit ${i + 1}/3 for patient ${patientId}`);
      }
    }

    console.log('Successfully added sample visits for all patients');
  } catch (error) {
    console.error('Error adding sample visits:', error);
  }
};

// Run the script
addSampleVisits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
