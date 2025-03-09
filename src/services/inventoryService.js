import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  runTransaction,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

/**
 * @typedef {Object} Supplier
 * @property {string} id - Unique identifier
 * @property {string} name - Supplier name
 * @property {string} contactPerson - Contact person name
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone number
 * @property {string} address - Supplier address
 * @property {string} [taxId] - Tax identification number
 * @property {string} [registrationNumber] - Business registration number
 * @property {string|null} createdAt - Creation timestamp
 * @property {string|null} updatedAt - Last update timestamp
 */

const SUPPLIERS_COLLECTION = 'inventory_suppliers';
const ITEMS_COLLECTION = 'inventory_items';
const BATCHES_COLLECTION = 'inventory_batches';
const COUNTERS_COLLECTION = 'inventory_counters';

/**
 * Helper function to convert Firestore timestamps to ISO strings
 * @param {Object} doc - Firestore document
 * @returns {Object} Document with timestamps converted to ISO strings
 */
const convertTimestamps = (doc) => {
  const data = doc.data();
  const result = {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString() || null,
    updatedAt: data.updatedAt?.toDate().toISOString() || null,
  };
  
  // Also convert expectedDeliveryDate if it exists
  if (data.expectedDeliveryDate) {
    result.expectedDeliveryDate = data.expectedDeliveryDate.toDate().toISOString();
  }
  
  return result;
};

/**
 * Helper function to get next ID from counter
 * @param {string} counterName - Name of the counter to increment
 * @returns {Promise<number>} Promise resolving to the next ID
 */
const getNextId = async (counterName) => {
  const counterRef = doc(db, COUNTERS_COLLECTION, counterName);
  
  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const nextId = counterDoc.exists() ? counterDoc.data().value + 1 : 1;
    
    transaction.set(counterRef, { value: nextId }, { merge: true });
    
    return nextId;
  });
};

/**
 * Inventory service for managing suppliers
 * @namespace
 */
export const inventoryService = {
  /**
   * Get all inventory items
   * @returns {Promise<Array>} Promise resolving to array of inventory items
   */
  getAllItems: async () => {
    try {
      console.log('Fetching all inventory items...');
      const querySnapshot = await getDocs(collection(db, ITEMS_COLLECTION));
      const items = querySnapshot.docs.map(convertTimestamps);
      console.log('Fetched inventory items:', items);
      return items;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error(error.message || 'Failed to fetch inventory items');
    }
  },

  /**
   * Get low stock items
   * @returns {Promise<Array>} Promise resolving to array of low stock items
   */
  getLowStockItems: async () => {
    try {
      console.log('Fetching low stock items...');
      // For now, we'll just return all items since we don't have actual stock levels
      // In a real implementation, we would query batches to calculate current stock levels
      const querySnapshot = await getDocs(collection(db, ITEMS_COLLECTION));
      const items = querySnapshot.docs.map(convertTimestamps);
      
      // This is a placeholder - in a real app, we would calculate current stock
      // by summing quantities across batches for each item
      console.log('Fetched low stock items:', []);
      return [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(error.message || 'Failed to fetch low stock items');
    }
  },

  /**
   * Create a new inventory item
   * @param {Object} item - The item data
   * @returns {Promise<string>} Promise resolving to the new item ID
   */
  createItem: async (item) => {
    try {
      console.log('Creating inventory item:', item);
      const itemId = await getNextId('itemId');
      const docRef = doc(db, ITEMS_COLLECTION, itemId.toString());
      await setDoc(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Created inventory item with ID:', itemId);
      return itemId.toString();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw new Error(error.message || 'Failed to create inventory item');
    }
  },

  /**
   * Update an existing inventory item
   * @param {string} id - Item ID
   * @param {Object} item - Partial item data to update
   * @returns {Promise<void>}
   */
  updateItem: async (id, item) => {
    try {
      console.log('Updating inventory item:', id, item);
      const docRef = doc(db, ITEMS_COLLECTION, id.toString());
      await updateDoc(docRef, {
        ...item,
        updatedAt: serverTimestamp()
      });
      console.log('Updated inventory item:', id);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error(error.message || 'Failed to update inventory item');
    }
  },

  /**
   * Get all suppliers
   * @returns {Promise<Array<Supplier>>} Promise resolving to array of suppliers
   */
  getAllSuppliers: async () => {
    try {
      console.log('Fetching all suppliers...');
      const querySnapshot = await getDocs(collection(db, SUPPLIERS_COLLECTION));
      const suppliers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || null,
      }));
      console.log('Fetched suppliers:', suppliers);
      return suppliers;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(error.message || 'Failed to fetch suppliers');
    }
  },

  /**
   * Create a new supplier
   * @param {Object} supplier - The supplier data without id, createdAt, and updatedAt
   * @returns {Promise<string>} Promise resolving to the new supplier ID
   */
  createSupplier: async (supplier) => {
    try {
      console.log('Creating supplier:', supplier);
      const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
        ...supplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Created supplier with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(error.message || 'Failed to create supplier');
    }
  },

  /**
   * Update an existing supplier
   * @param {string} id - Supplier ID
   * @param {Object} supplier - Partial supplier data to update
   * @returns {Promise<void>}
   */
  updateSupplier: async (id, supplier) => {
    try {
      console.log('Updating supplier:', id, supplier);
      const docRef = doc(db, SUPPLIERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...supplier,
        updatedAt: serverTimestamp()
      });
      console.log('Updated supplier:', id);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(error.message || 'Failed to update supplier');
    }
  },

  /**
   * Delete a supplier
   * @param {string} id - Supplier ID
   * @returns {Promise<void>}
   */
  deleteSupplier: async (id) => {
    try {
      console.log('Deleting supplier:', id);
      const docRef = doc(db, SUPPLIERS_COLLECTION, id.toString());
      await deleteDoc(docRef);
      console.log('Deleted supplier:', id);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error.message || 'Failed to delete supplier');
    }
  },

  /**
   * Get all purchase orders
   * @returns {Promise<Array>} Promise resolving to array of purchase orders
   */
  getAllPurchaseOrders: async () => {
    try {
      console.log('Fetching all purchase orders...');
      const querySnapshot = await getDocs(collection(db, 'inventory_purchase_orders'));
      const orders = querySnapshot.docs.map(convertTimestamps);
      console.log('Fetched purchase orders:', orders);
      return orders;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw new Error(error.message || 'Failed to fetch purchase orders');
    }
  },

  /**
   * Create a new purchase order
   * @param {Object} order - The purchase order data
   * @returns {Promise<string>} Promise resolving to the new purchase order ID
   */
  createPurchaseOrder: async (order) => {
    try {
      console.log('Creating purchase order:', order);
      const orderId = await getNextId('purchaseOrderId');
      const docRef = doc(db, 'inventory_purchase_orders', orderId.toString());
      
      await setDoc(docRef, {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('Created purchase order with ID:', orderId);
      return orderId.toString();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw new Error(error.message || 'Failed to create purchase order');
    }
  },

  /**
   * Get expiring batches
   * @param {number} daysThreshold - Number of days to check for expiring items
   * @returns {Promise<Array>} Promise resolving to array of expiring batches
   */
  getExpiringBatches: async (daysThreshold = 30) => {
    try {
      console.log(`Fetching batches expiring in the next ${daysThreshold} days...`);
      const today = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(today.getDate() + daysThreshold);
      
      // In a real implementation, we would use a Firestore query with where clause
      // to filter by expiry date, but for now we'll fetch all and filter in memory
      const querySnapshot = await getDocs(collection(db, BATCHES_COLLECTION));
      const batches = querySnapshot.docs.map(convertTimestamps);
      
      // Filter batches that expire within the threshold
      const expiringBatches = batches.filter(batch => {
        if (!batch.expiryDate) return false;
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate > today && expiryDate <= thresholdDate;
      });
      
      console.log('Fetched expiring batches:', expiringBatches);
      return expiringBatches;
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      throw new Error(error.message || 'Failed to fetch expiring batches');
    }
  }
}; 