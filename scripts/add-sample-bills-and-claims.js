const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Insurance providers
const insuranceProviders = [
  { name: 'Blue Cross Blue Shield', type: 'private' },
  { name: 'Aetna', type: 'private' },
  { name: 'UnitedHealthcare', type: 'private' },
  { name: 'Medicare', type: 'medicare' },
  { name: 'Medicaid', type: 'medicaid' }
];

// Common medical procedures with typical costs
const medicalProcedures = [
  { description: 'Initial Consultation', unitPrice: 150.00, insuranceCoverage: 0.8 },
  { description: 'Follow-up Visit', unitPrice: 75.00, insuranceCoverage: 0.9 },
  { description: 'Complete Blood Count (CBC)', unitPrice: 35.00, insuranceCoverage: 0.9 },
  { description: 'Basic Metabolic Panel', unitPrice: 45.00, insuranceCoverage: 0.85 },
  { description: 'Chest X-Ray', unitPrice: 200.00, insuranceCoverage: 0.8 },
  { description: 'MRI Scan', unitPrice: 1200.00, insuranceCoverage: 0.7 },
  { description: 'CT Scan', unitPrice: 800.00, insuranceCoverage: 0.75 },
  { description: 'Physical Therapy Session', unitPrice: 90.00, insuranceCoverage: 0.8 },
  { description: 'Vaccination', unitPrice: 85.00, insuranceCoverage: 1.0 },
  { description: 'EKG/ECG', unitPrice: 150.00, insuranceCoverage: 0.85 }
];

// Sample facilities
const facilities = [
  { id: 'facility1', name: 'Central Hospital' },
  { id: 'facility2', name: 'West Medical Center' },
  { id: 'facility3', name: 'East Health Clinic' }
];

// Sample patients with insurance info
const samplePatients = [
  { 
    id: 'patient1', 
    name: 'John Doe', 
    facilityId: 'facility1',
    insurance: {
      provider: insuranceProviders[0],
      policyNumber: 'POL-001-2023',
      groupNumber: 'GRP-001'
    }
  },
  { 
    id: 'patient2', 
    name: 'Jane Smith', 
    facilityId: 'facility1',
    insurance: {
      provider: insuranceProviders[1],
      policyNumber: 'POL-002-2023',
      groupNumber: 'GRP-002'
    }
  },
  { 
    id: 'patient3', 
    name: 'Robert Johnson', 
    facilityId: 'facility2',
    insurance: {
      provider: insuranceProviders[2],
      policyNumber: 'POL-003-2023',
      groupNumber: 'GRP-003'
    }
  },
  { 
    id: 'patient4', 
    name: 'Mary Williams', 
    facilityId: 'facility2',
    insurance: {
      provider: insuranceProviders[3],
      policyNumber: 'POL-004-2023',
      groupNumber: 'GRP-004'
    }
  },
  { 
    id: 'patient5', 
    name: 'James Brown', 
    facilityId: 'facility3',
    insurance: {
      provider: insuranceProviders[4],
      policyNumber: 'POL-005-2023',
      groupNumber: 'GRP-005'
    }
  }
];

// Generate random date within the last 6 months
function generateRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
  return new Date(sixMonthsAgo.getTime() + Math.random() * (Date.now() - sixMonthsAgo.getTime()));
}

// Generate random items for a bill
function generateBillItems(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const procedure = medicalProcedures[Math.floor(Math.random() * medicalProcedures.length)];
    const quantity = Math.floor(Math.random() * 2) + 1;
    items.push({
      ...procedure,
      quantity,
      amount: procedure.unitPrice * quantity
    });
  }
  return items;
}

// Generate an insurance claim for a bill
function generateInsuranceClaim(bill, patient) {
  const claimStatuses = ['pending', 'submitted', 'approved', 'denied', 'resubmitted', 'partial'];
  const status = claimStatuses[Math.floor(Math.random() * claimStatuses.length)];
  
  const coveredAmount = bill.items.reduce((total, item) => {
    return total + (item.amount * item.insuranceCoverage);
  }, 0);

  return {
    billId: bill.id,
    claimNumber: `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patientId: patient.id,
    patientName: patient.name,
    facilityId: patient.facilityId,
    insuranceProvider: patient.insurance.provider.name,
    insuranceType: patient.insurance.provider.type,
    policyNumber: patient.insurance.policyNumber,
    groupNumber: patient.insurance.groupNumber,
    submissionDate: bill.createdAt,
    status,
    totalAmount: bill.totalAmount,
    coveredAmount: parseFloat(coveredAmount.toFixed(2)),
    deductible: parseFloat((bill.totalAmount * 0.1).toFixed(2)),
    copay: parseFloat((bill.totalAmount * 0.05).toFixed(2)),
    notes: status === 'denied' ? 'Coverage verification required' : '',
    createdAt: bill.createdAt,
    updatedAt: new Date().toISOString()
  };
}

// Generate a bill
function generateBill(index) {
  const patient = samplePatients[Math.floor(Math.random() * samplePatients.length)];
  const items = generateBillItems(Math.floor(Math.random() * 3) + 1);
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = parseFloat((subtotal * 0.1).toFixed(2));
  const totalAmount = parseFloat((subtotal + tax).toFixed(2));
  const createdAt = generateRandomDate().toISOString();

  return {
    id: `BILL-${String(index + 1).padStart(3, '0')}`,
    billNumber: `BILL-${String(index + 1).padStart(3, '0')}`,
    patientId: patient.id,
    patientName: patient.name,
    facilityId: patient.facilityId,
    items,
    subtotal,
    tax,
    totalAmount,
    status: 'pending',
    createdAt,
    updatedAt: new Date().toISOString(),
    patient
  };
}

async function addSampleBillsAndClaims() {
  try {
    const billsToAdd = 15; // Number of sample bills to generate
    const batch = db.batch();
    const bills = [];
    const claims = [];

    // Generate bills and claims
    for (let i = 0; i < billsToAdd; i++) {
      const bill = generateBill(i);
      bills.push(bill);
      
      // Generate claim for the bill
      const claim = generateInsuranceClaim(bill, bill.patient);
      claims.push(claim);

      // Add claim to bill object
      bill.claims = [claim];
      
      // Add bill with claims to batch
      const billRef = db.collection('bills').doc(bill.id);
      batch.set(billRef, bill);

      // Also store claim separately in insurance_claims collection
      const claimRef = db.collection('insurance_claims').doc(claim.claimNumber);
      batch.set(claimRef, claim);
    }

    await batch.commit();
    console.log(`Successfully added ${billsToAdd} sample bills with insurance claims`);
    
    // Log distribution of data
    const facilityCounts = {};
    bills.forEach(bill => {
      facilityCounts[bill.facilityId] = (facilityCounts[bill.facilityId] || 0) + 1;
    });
    
    console.log('\nBills distribution by facility:');
    Object.entries(facilityCounts).forEach(([facilityId, count]) => {
      const facility = facilities.find(f => f.id === facilityId);
      console.log(`${facility.name}: ${count} bills`);
    });

    const claimStatusCounts = {};
    claims.forEach(claim => {
      claimStatusCounts[claim.status] = (claimStatusCounts[claim.status] || 0) + 1;
    });

    console.log('\nClaims distribution by status:');
    Object.entries(claimStatusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} claims`);
    });

  } catch (error) {
    console.error('Error adding sample bills and claims:', error);
  }
}

// Run the script
addSampleBillsAndClaims()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
