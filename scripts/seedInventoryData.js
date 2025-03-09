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

// Function to clear a collection using batched deletes
async function clearCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Cleared collection: ${collectionName}`);
}

// Function to reset a counter
async function resetCounter(counterName) {
  await db.collection(COUNTERS_COLLECTION).doc(counterName).set({ value: 0 });
  console.log(`Reset counter: ${counterName}`);
}

// Sample data
const suppliers = [
  {
    name: 'MedSupply Co.',
    contactPerson: 'John Smith',
    email: 'john.smith@medsupply.com',
    phone: '(555) 123-4567',
    address: '123 Medical Drive, Healthcare City, HC 12345',
    taxId: 'MS123456789',
    registrationNumber: 'REG-2024-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'PharmaCare Solutions',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.j@pharmacare.com',
    phone: '(555) 987-6543',
    address: '456 Pharma Lane, Medicine Town, MT 67890',
    taxId: 'PC987654321',
    registrationNumber: 'REG-2024-002',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const generateLocations = (facilityIds) => {
  const locations = [];

  // Create locations for each facility
  facilityIds.forEach(facilityId => {
    locations.push(
      {
        name: 'Main Pharmacy',
        description: 'Main pharmacy storage for medications and supplies',
        facilityId,
        type: 'PHARMACY',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Central Warehouse',
        description: 'Central storage facility for bulk medical supplies',
        facilityId,
        type: 'WAREHOUSE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Emergency Department Storage',
        description: 'Storage area for emergency department supplies',
        facilityId,
        type: 'STORAGE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  });

  return locations;
};

const items = [
  {
    name: 'Ibuprofen 200mg',
    description: 'Pain relief and anti-inflammatory medication',
    category: 'MEDICATION',
    unit: 'tablet',
    minStockLevel: 1000,
    reorderPoint: 1500,
    medicalCodes: [
      {
        code: '387207008',
        type: 'SNOMED',
        description: 'Ibuprofen (substance)',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    name: 'Disposable Face Masks',
    description: 'Level 3 surgical face masks',
    category: 'PPE',
    unit: 'piece',
    minStockLevel: 500,
    reorderPoint: 750,
    medicalCodes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    name: 'Blood Pressure Monitor',
    description: 'Digital blood pressure monitoring device',
    category: 'EQUIPMENT',
    unit: 'unit',
    minStockLevel: 10,
    reorderPoint: 15,
    medicalCodes: [
      {
        code: '23798009',
        type: 'SNOMED',
        description: 'Blood pressure monitor (physical object)',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// Function to generate sample batches based on items
const generateBatches = (itemIds, locationIds, supplierIds) => {
  const batches = [];

  itemIds.forEach(itemId => {
    // Create multiple batches for each item
    for (let i = 0; i < 2; i++) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years expiry

      batches.push({
        itemId,
        batchNumber: `BATCH-${itemId}-${i + 1}`,
        expiryDate,
        manufacturingDate: new Date(),
        quantity: Math.floor(Math.random() * 1000) + 100,
        cost: Math.floor(Math.random() * 100) + 10,
        locationId: locationIds[Math.floor(Math.random() * locationIds.length)],
        supplierId: supplierIds[Math.floor(Math.random() * supplierIds.length)],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return batches;
};

// Function to generate sample purchase orders
const generatePurchaseOrders = (itemIds, supplierIds) => {
  const orders = [];
  const statuses = ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED'];

  supplierIds.forEach(supplierId => {
    const items = itemIds
      .slice(0, Math.floor(Math.random() * itemIds.length) + 1)
      .map(itemId => ({
        itemId,
        quantity: Math.floor(Math.random() * 100) + 10,
        unitPrice: Math.floor(Math.random() * 50) + 5,
        totalPrice: 0,
        notes: 'Sample order item',
      }));

    // Calculate total price for each item and order
    let totalAmount = 0;
    items.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice;
      totalAmount += item.totalPrice;
    });

    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 14); // 2 weeks delivery

    orders.push({
      supplierId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      items,
      totalAmount,
      expectedDeliveryDate,
      notes: 'Sample purchase order',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return orders;
};

// Function to get facility IDs from Firestore
const getFacilityIds = async () => {
  const facilityIds = [];
  const facilitiesSnapshot = await db.collection('facilities').get();
  
  facilitiesSnapshot.forEach(doc => {
    facilityIds.push(doc.id);
  });

  if (facilityIds.length === 0) {
    throw new Error('No facilities found in the database. Please create facilities first.');
  }

  return facilityIds;
};

// Main seeding function
const seedInventoryData = async () => {
  try {
    console.log('Starting to seed inventory data...');

    // Clear all existing data
    await clearCollection('inventory_suppliers');
    await clearCollection('inventory_locations');
    await clearCollection('inventory_items');
    await clearCollection('inventory_batches');
    await clearCollection('inventory_purchase_orders');

    // Reset all counters
    await resetCounter('supplierId');
    await resetCounter('locationId');
    await resetCounter('itemId');
    await resetCounter('batchId');
    await resetCounter('orderId');

    // Get facility IDs
    const facilityIds = await getFacilityIds();
    console.log(`Found ${facilityIds.length} facilities`);

    // Create suppliers with numeric IDs
    const supplierIds = [];
    for (const supplier of suppliers) {
      const supplierId = await getNextId('supplierId');
      await db.collection('inventory_suppliers').doc(supplierId.toString()).set(supplier);
      supplierIds.push(supplierId);
      console.log(`Created supplier: ${supplier.name} with ID: ${supplierId}`);
    }

    // Create locations with numeric IDs
    const locationIds = [];
    const locations = generateLocations(facilityIds);
    for (const location of locations) {
      const locationId = await getNextId('locationId');
      await db.collection('inventory_locations').doc(locationId.toString()).set(location);
      locationIds.push(locationId);
      console.log(`Created location: ${location.name} with ID: ${locationId}`);
    }

    // Create items with numeric IDs
    const itemIds = [];
    for (const item of items) {
      const itemId = await getNextId('itemId');
      await db.collection('inventory_items').doc(itemId.toString()).set(item);
      itemIds.push(itemId);
      console.log(`Created item: ${item.name} with ID: ${itemId}`);
    }

    // Create batches with numeric IDs
    const batches = generateBatches(itemIds, locationIds, supplierIds);
    for (const batch of batches) {
      const batchId = await getNextId('batchId');
      await db.collection('inventory_batches').doc(batchId.toString()).set(batch);
      console.log(`Created batch: ${batch.batchNumber} with ID: ${batchId}`);
    }

    // Create purchase orders with numeric IDs
    const orders = generatePurchaseOrders(itemIds, supplierIds);
    for (const order of orders) {
      const orderId = await getNextId('orderId');
      await db.collection('inventory_purchase_orders').doc(orderId.toString()).set(order);
      console.log(`Created purchase order with ID: ${orderId}`);
    }

    console.log('Successfully seeded inventory data!');
  } catch (error) {
    console.error('Error seeding inventory data:', error);
    throw error;
  }
};

// Run the seeding
seedInventoryData()
  .then(() => {
    console.log('Inventory data seeding complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to seed inventory data:', error);
    process.exit(1);
  }); 