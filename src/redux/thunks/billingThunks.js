import { createAsyncThunk } from '@reduxjs/toolkit';
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase/config';
import {
  setBills,
  setCurrentBill,
  setLoading,
  setError,
  addBill,
  updateBill,
  emailBillStart,
  emailBillSuccess,
  emailBillFailure
} from '../slices/billingSlice';

// Helper function to get user's facilities
async function getUserFacilities(userId) {
  const userFacilitiesRef = collection(db, 'user_facilities');
  const q = query(userFacilitiesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().facilityId);
}

// Fetch all bills
export const fetchBills = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { role, user } = getState().auth;
    
    const billsRef = collection(db, 'bills');
    
    let q;
    // Admin can see all bills
    if (role === 'admin') {
      q = query(billsRef, orderBy('createdAt', 'desc'));
    } else if (role === 'facility_admin') {
      // Get facility admin's facilities
      const userFacilities = await getUserFacilities(user.uid);
      
      // Facility admin sees bills from their facilities
      q = query(
        billsRef,
        where('facilityId', 'in', userFacilities),
        orderBy('createdAt', 'desc')
      );
    } else {
      dispatch(setError('Access denied: Insufficient permissions'));
      return;
    }
    
    const snapshot = await getDocs(q);
    const bills = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert any Timestamp objects to ISO strings
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        dueDate: data.dueDate?.toDate?.() ? data.dueDate.toDate().toISOString() : data.dueDate,
        lastPaymentDate: data.lastPaymentDate?.toDate?.() ? data.lastPaymentDate.toDate().toISOString() : data.lastPaymentDate,
        payments: data.payments?.map(payment => ({
          ...payment,
          date: payment.date?.toDate?.() ? payment.date.toDate().toISOString() : payment.date
        }))
      };
    });
    
    dispatch(setBills(bills));
  } catch (error) {
    console.error('Error fetching bills:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch bills by patient ID
export const fetchPatientBills = (patientId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { role, user } = getState().auth;
    const billsRef = collection(db, 'bills');
    
    let q;
    if (role === 'admin') {
      q = query(
        billsRef,
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
    } else if (role === 'facility_admin') {
      // Get facility admin's facilities
      const userFacilities = await getUserFacilities(user.uid);
      
      q = query(
        billsRef,
        where('patientId', '==', patientId),
        where('facilityId', 'in', userFacilities),
        orderBy('createdAt', 'desc')
      );
    } else {
      dispatch(setError('Access denied: Insufficient permissions'));
      return;
    }
    
    const snapshot = await getDocs(q);
    const bills = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        dueDate: data.dueDate?.toDate?.() ? data.dueDate.toDate().toISOString() : data.dueDate,
        lastPaymentDate: data.lastPaymentDate?.toDate?.() ? data.lastPaymentDate.toDate().toISOString() : data.lastPaymentDate,
        payments: data.payments?.map(payment => ({
          ...payment,
          date: payment.date?.toDate?.() ? payment.date.toDate().toISOString() : payment.date
        }))
      };
    });
    dispatch(setBills(bills));
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch single bill
export const fetchBillById = (billId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { role, user } = getState().auth;

    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);
    
    if (!billDoc.exists()) {
      dispatch(setError('Bill not found'));
      return;
    }

    const billData = billDoc.data();

    if (!billData) {
      dispatch(setError('Invalid bill data'));
      return;
    }
    
    // Check access permissions
    if (role === 'admin') {
      // Admin has access to all bills
      dispatch(setCurrentBill({
        id: billDoc.id,
        ...serializeBillData(billData)
      }));
    } else if (role === 'facility_admin') {
      // For facility admin, only check facility access if bill has a facilityId
      if (!billData.facilityId) {
        dispatch(setError('Access denied: This bill is not associated with any facility'));
      } else {
        const userFacilities = await getUserFacilities(user.uid);
        if (userFacilities.includes(billData.facilityId)) {
          dispatch(setCurrentBill({
            id: billDoc.id,
            ...serializeBillData(billData)
          }));
        } else {
          dispatch(setError('Access denied: You do not have permission to view this bill'));
        }
      }
    } else {
      dispatch(setError('Access denied: Insufficient permissions'));
    }
  } catch (error) {
    console.error('Error fetching bill:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Helper function to serialize bill data
function serializeBillData(billData) {
  return {
    ...billData,
    createdAt: billData.createdAt?.toDate?.() ? billData.createdAt.toDate().toISOString() : billData.createdAt,
    updatedAt: billData.updatedAt?.toDate?.() ? billData.updatedAt.toDate().toISOString() : billData.updatedAt,
    dueDate: billData.dueDate?.toDate?.() ? billData.dueDate.toDate().toISOString() : billData.dueDate,
    lastPaymentDate: billData.lastPaymentDate?.toDate?.() ? billData.lastPaymentDate.toDate().toISOString() : billData.lastPaymentDate,
    payments: billData.payments?.map(payment => ({
      ...payment,
      date: payment.date?.toDate?.() ? payment.date.toDate().toISOString() : payment.date
    }))
  };
}

// Process payment
export const processPayment = (billId, paymentData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { role, user } = getState().auth;
    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);
    
    if (!billDoc.exists()) {
      dispatch(setError('Bill not found'));
      return;
    }

    const currentBill = billDoc.data();
    
    // Check access permissions
    let hasAccess = role === 'admin';
    if (!hasAccess && role === 'facility_admin') {
      const userFacilities = await getUserFacilities(user.uid);
      hasAccess = userFacilities.includes(currentBill.facilityId);
    }

    if (hasAccess) {
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
    } else {
      dispatch(setError('Access denied: You do not have permission to process payments for this bill'));
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Email bill
export const emailBill = createAsyncThunk(
  'billing/emailBill',
  async (billId, { dispatch }) => {
    try {
      dispatch(emailBillStart());
      
      const functions = getFunctions();
      const sendBillEmail = httpsCallable(functions, 'sendBillEmail');
      
      const result = await sendBillEmail({ billId });
      dispatch(emailBillSuccess());
      return result.data;
    } catch (error) {
      console.error('Error emailing bill:', error);
      dispatch(emailBillFailure(error.message));
      throw error;
    }
  }
);
