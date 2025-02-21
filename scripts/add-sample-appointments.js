const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const sampleAppointments = [
  {
    patientName: 'John Smith',
    doctorName: 'Dr. Sarah Wilson',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(14, 30, 0, 0))), // Today at 2:30 PM
    purpose: 'Annual Checkup',
    status: 'scheduled'
  },
  {
    patientName: 'Emma Johnson',
    doctorName: 'Dr. Michael Brown',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(10, 0, 0, 0))), // Today at 10:00 AM
    purpose: 'Follow-up Visit',
    status: 'completed'
  },
  {
    patientName: 'Robert Davis',
    doctorName: 'Dr. Sarah Wilson',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 1))), // Tomorrow
    purpose: 'Blood Test Results Review',
    status: 'scheduled'
  },
  {
    patientName: 'Maria Garcia',
    doctorName: 'Dr. Michael Brown',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 1))), // Yesterday
    purpose: 'Vaccination',
    status: 'cancelled'
  },
  {
    patientName: 'James Wilson',
    doctorName: 'Dr. Sarah Wilson',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(15, 45, 0, 0))), // Today at 3:45 PM
    purpose: 'Prescription Renewal',
    status: 'scheduled'
  },
  {
    patientName: 'Linda Chen',
    doctorName: 'Dr. Michael Brown',
    date: admin.firestore.Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 2))), // 2 days ago
    purpose: 'Post-Surgery Follow-up',
    status: 'completed'
  }
];

async function addSampleAppointments() {
  try {
    const appointmentsRef = db.collection('appointments');
    
    for (const appointment of sampleAppointments) {
      await appointmentsRef.add(appointment);
      console.log(`Added appointment for ${appointment.patientName}`);
    }
    
    console.log('Successfully added all sample appointments');
  } catch (error) {
    console.error('Error adding sample appointments:', error);
  }
}

// Run the script
addSampleAppointments()
  .then(() => {
    console.log('Completed adding sample appointments');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
