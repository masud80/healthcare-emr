const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Counter collection for managing numeric IDs
const COUNTERS_COLLECTION = 'inventory_counters';

// Function to get next ID for a collection
async function getNextId(counterName) {
  const counterRef = db.collection(COUNTERS_COLLECTION).doc(counterName);
  const counterDoc = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterRef);
    const nextId = doc.exists ? doc.data().value + 1 : 1;
    transaction.set(counterRef, { value: nextId }, { merge: true });
    return nextId;
  });
  return counterDoc;
}

// Sample suppliers data
const suppliers = [
  {
    name: 'MedTech Solutions Inc.',
    contactPerson: 'John Smith',
    email: 'john.smith@medtech.com',
    phone: '(555) 123-4567',
    address: '123 Medical Drive, Suite 100, San Francisco, CA 94105',
    taxId: 'MT123456789',
    registrationNumber: 'REG-2024-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Global Healthcare Supplies',
    contactPerson: 'Sarah Johnson',
    email: 'sjohnson@globalhealthcare.com',
    phone: '(555) 234-5678',
    address: '456 Hospital Way, Chicago, IL 60601',
    taxId: 'GH987654321',
    registrationNumber: 'REG-2024-002',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'PharmaCare Distribution',
    contactPerson: 'Michael Chen',
    email: 'mchen@pharmacare.com',
    phone: '(555) 345-6789',
    address: '789 Pharmacy Road, Boston, MA 02108',
    taxId: 'PC456789123',
    registrationNumber: 'REG-2024-003',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Surgical Equipment Co.',
    contactPerson: 'Emily Davis',
    email: 'edavis@surgicalequip.com',
    phone: '(555) 456-7890',
    address: '321 Surgery Lane, Houston, TX 77001',
    taxId: 'SE789123456',
    registrationNumber: 'REG-2024-004',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Lab Supplies Direct',
    contactPerson: 'David Wilson',
    email: 'dwilson@labsupplies.com',
    phone: '(555) 567-8901',
    address: '654 Laboratory Blvd, Seattle, WA 98101',
    taxId: 'LS234567890',
    registrationNumber: 'REG-2024-005',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'PPE Specialists Ltd.',
    contactPerson: 'Lisa Anderson',
    email: 'landerson@ppespecialists.com',
    phone: '(555) 678-9012',
    address: '987 Safety Street, Miami, FL 33101',
    taxId: 'PS345678901',
    registrationNumber: 'REG-2024-006',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Medical Devices Plus',
    contactPerson: 'Robert Taylor',
    email: 'rtaylor@meddevices.com',
    phone: '(555) 789-0123',
    address: '741 Device Drive, Denver, CO 80201',
    taxId: 'MD456789012',
    registrationNumber: 'REG-2024-007',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Healthcare Consumables Inc.',
    contactPerson: 'Amanda Martinez',
    email: 'amartinez@hcconsumables.com',
    phone: '(555) 890-1234',
    address: '852 Supply Street, Phoenix, AZ 85001',
    taxId: 'HC567890123',
    registrationNumber: 'REG-2024-008',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Main seeding function
async function seedSuppliers() {
  try {
    console.log('Starting to seed supplier data...');
    
    // Clear existing suppliers
    const existingSuppliers = await db.collection('inventory_suppliers').get();
    const batch = db.batch();
    existingSuppliers.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared existing suppliers');

    // Reset the supplier counter
    await db.collection(COUNTERS_COLLECTION).doc('supplierId').set({ value: 0 });

    // Add new suppliers with numeric IDs
    const supplierIds = [];
    for (const supplier of suppliers) {
      const supplierId = await getNextId('supplierId');
      await db.collection('inventory_suppliers').doc(supplierId.toString()).set(supplier);
      supplierIds.push(supplierId);
      console.log(`Added supplier: ${supplier.name} with ID: ${supplierId}`);
    }
    
    console.log('Successfully seeded all supplier data!');
    return supplierIds;
  } catch (error) {
    console.error('Error seeding supplier data:', error);
    throw error;
  }
}

// Run the seeding
seedSuppliers()
  .then(() => {
    console.log('Supplier data seeding complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to seed supplier data:', error);
    process.exit(1);
  }); 