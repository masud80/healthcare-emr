import { createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const createAuditLog = createAsyncThunk(
  'audit/createLog',
  async (logData, { rejectWithValue }) => {
    try {
      const auditRef = collection(db, 'audit');
      const log = {
        ...logData,
        timestamp: Timestamp.now()
      };
      await addDoc(auditRef, log);
      return log;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchLogs',
  async ({ startDate, endDate, patientName }, { rejectWithValue }) => {
    try {
      const auditRef = collection(db, 'audit');
      let constraints = [];

      if (startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))));
      }
      if (endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(new Date(endDate))));
      }
      if (patientName) {
        constraints.push(where('details.patientName', '==', patientName));
      }

      const q = query(
        auditRef,
        ...constraints,
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      return logs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
