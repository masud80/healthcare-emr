import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  setBills,
  setCurrentBill,
  setLoading,
  setError,
  addBill,
  updateBill
} from '../slices/billingSlice';

// Fetch all bills
export const fetchBills = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billsRef = collection(db, 'bills');
    const q = query(billsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const bills = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setBills(bills));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Fetch bills by patient ID
export const fetchPatientBills = (patientId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billsRef = collection(db, 'bills');
    const q = query(
      billsRef, 
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const bills = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setBills(bills));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Fetch single bill
export const fetchBillById = (billId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);
    if (billDoc.exists()) {
      dispatch(setCurrentBill({
        id: billDoc.id,
        ...billDoc.data()
      }));
    } else {
      dispatch(setError('Bill not found'));
    }
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Create new bill
export const createBill = (billData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billsRef = collection(db, 'bills');
    const newBill = {
      ...billData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(billsRef, newBill);
    const createdBill = {
      id: docRef.id,
      ...newBill
    };
    dispatch(addBill(createdBill));
    return createdBill;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Update bill
export const updateBillById = (billId, updates) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billRef = doc(db, 'bills', billId);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(billRef, updatedData);
    const updatedBill = {
      id: billId,
      ...updatedData
    };
    dispatch(updateBill(updatedBill));
    return updatedBill;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Process payment
export const processPayment = (billId, paymentData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);
    
    if (!billDoc.exists()) {
      throw new Error('Bill not found');
    }

    const currentBill = billDoc.data();
    const paidAmount = parseFloat(currentBill.paidAmount || 0) + parseFloat(paymentData.amount);
    const totalAmount = parseFloat(currentBill.totalAmount);
    
    const status = paidAmount >= totalAmount ? 'paid' : 'partial';
    
    const updates = {
      paidAmount,
      status,
      lastPaymentDate: new Date().toISOString(),
      payments: [...(currentBill.payments || []), {
        ...paymentData,
        date: new Date().toISOString()
      }],
      updatedAt: new Date().toISOString()
    };

    await updateDoc(billRef, updates);
    
    const updatedBill = {
      id: billId,
      ...currentBill,
      ...updates
    };
    
    dispatch(updateBill(updatedBill));
    return updatedBill;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};
