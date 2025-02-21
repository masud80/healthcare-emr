const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Common medical procedures with typical costs
const medicalProcedures = [
  { description: 'Initial Consultation', unitPrice: 150.00 },
  { description: 'Follow-up Visit', unitPrice: 75.00 },
  { description: 'Complete Blood Count (CBC)', unitPrice: 35.00 },
  { description: 'Basic Metabolic Panel', unitPrice: 45.00 },
  { description: 'Chest X-Ray', unitPrice: 200.00 },
  { description: 'MRI Scan', unitPrice: 1200.00 },
  { description: 'CT Scan', unitPrice: 800.00 },
  { description: 'Physical Therapy Session', unitPrice: 90.00 },
  { description: 'Vaccination', unitPrice: 85.00 },
  { description: 'EKG/ECG', unitPrice: 150.00 },
  { description: 'Ultrasound', unitPrice: 300.00 },
  { description: 'Dental Cleaning', unitPrice: 120.00 },
  { description: 'Eye Examination', unitPrice: 95.00 },
  { description: 'Allergy Testing', unitPrice: 250.00 },
  { description: 'Prescription Medication', unitPrice: 65.00 }
];

// Payment methods
const paymentMethods = ['cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer'];

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

// Generate a random date within the last 6 months
function generateRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
  return new Date(sixMonthsAgo.getTime() + Math.random() * (Date.now() - sixMonthsAgo.getTime()));
}

// Generate random payment history
function generatePayments(totalAmount, createdAt) {
  const payments = [];
  let remainingAmount = totalAmount;
  const maxPayments = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < maxPayments && remainingAmount > 0; i++) {
    const paymentAmount = i === maxPayments - 1 ? 
      remainingAmount : 
      Math.min(remainingAmount, totalAmount * (Math.random() * 0.7 + 0.1));
    
    payments.push({
      amount: parseFloat(paymentAmount.toFixed(2)),
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      reference: `PAY-${Date.now()}-${i}`,
      date: new Date(new Date(createdAt).getTime() + (i * 24 * 60 * 60 * 1000)).toISOString()
    });

    remainingAmount -= paymentAmount;
  }

  return payments;
}

// Sample patients data
const samplePatients = [
  { id: 'patient1', name: 'John Doe', facilityId: 'facility1' },
  { id: 'patient2', name: 'Jane Smith', facilityId: 'facility1' },
  { id: 'patient3', name: 'Robert Johnson', facilityId: 'facility2' },
  { id: 'patient4', name: 'Mary Williams', facilityId: 'facility2' },
  { id: 'patient5', name: 'James Brown', facilityId: 'facility3' }
];

// Generate a sample bill
function generateBill(index) {
  const patient = samplePatients[Math.floor(Math.random() * samplePatients.length)];
  const items = generateBillItems(Math.floor(Math.random() * 3) + 1);
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = parseFloat((subtotal * 0.1).toFixed(2));
  const discount = Math.random() > 0.7 ? parseFloat((subtotal * 0.05).toFixed(2)) : 0;
  const totalAmount = parseFloat((subtotal + tax - discount).toFixed(2));
  const createdAt = generateRandomDate().toISOString();
  const payments = generatePayments(totalAmount, createdAt);
  const paidAmount = parseFloat(payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2));

  return {
    billNumber: `BILL-${String(index + 1).padStart(3, '0')}`,
    patientId: patient.id,
    patientName: patient.name,
    facilityId: patient.facilityId,
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
    paidAmount,
    status: paidAmount === 0 ? 'pending' : 
            paidAmount < totalAmount ? 'partial' : 'paid',
    paymentTerms: Math.random() > 0.5 ? 'due_on_receipt' : 'net_30',
    createdAt,
    updatedAt: new Date().toISOString(),
    payments,
    notes: Math.random() > 0.7 ? 'Insurance claim pending' : ''
  };
}

async function addSampleBillingData() {
  try {
    const billsToAdd = 20; // Number of sample bills to generate
    const batch = db.batch();

    for (let i = 0; i < billsToAdd; i++) {
      const billData = generateBill(i);
      const billRef = db.collection('bills').doc();
      batch.set(billRef, billData);
    }

    await batch.commit();
    console.log(`Successfully added ${billsToAdd} sample bills`);
  } catch (error) {
    console.error('Error adding sample billing data:', error);
  }
}

// Run the script
addSampleBillingData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
