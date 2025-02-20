const sampleRecords = [
  {
    patientName: "John Smith",
    date: new Date("2024-01-15").toISOString(),
    type: "Initial Consultation",
    description: "Patient presented with flu-like symptoms",
    diagnosis: "Seasonal Influenza",
    treatment: "Prescribed Tamiflu and recommended rest for 5 days"
  },
  {
    patientName: "Sarah Johnson", 
    date: new Date("2024-01-14").toISOString(),
    type: "Follow-up",
    description: "Follow up for diabetes management",
    diagnosis: "Type 2 Diabetes - Well Controlled",
    treatment: "Continue current medication regimen. Schedule next check in 3 months"
  },
  {
    patientName: "Michael Brown",
    date: new Date("2024-01-13").toISOString(), 
    type: "Emergency",
    description: "Patient arrived with severe chest pain",
    diagnosis: "Acute Gastritis",
    treatment: "Prescribed antacids and scheduled follow-up in 1 week"
  }
];

const addSampleMedicalRecords = async (db) => {
  try {
    const batch = db.batch();
    const collectionRef = db.collection('medical_records');
    
    for (const record of sampleRecords) {
      const docRef = collectionRef.doc();
      batch.set(docRef, record);
      console.log('Prepared record for:', record.patientName);
    }
    
    await batch.commit();
    console.log('Successfully added all sample medical records');
  } catch (error) {
    console.error('Error adding sample records:', error);
    throw error;
  }
};

module.exports = addSampleMedicalRecords;
