import { createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
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
  async ({ startDate, endDate, userId }, { rejectWithValue }) => {
    try {
      const auditRef = collection(db, 'audit');
      let constraints = [];

      // Add default constraint to get recent logs if no filters are applied
      if (!startDate && !endDate && !userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)));
      } else {
        if (startDate) {
          constraints.push(where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))));
        }
        if (endDate) {
          constraints.push(where('timestamp', '<=', Timestamp.fromDate(new Date(endDate))));
        }
        if (userId) {
          constraints.push(where('userId', '==', userId));
        }
      }

      // Add orderBy and limit
      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(100)); // Limit to prevent loading too many logs

      const q = query(auditRef, ...constraints);

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
