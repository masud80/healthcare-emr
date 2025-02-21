import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Async thunks
export const createPrescription = createAsyncThunk(
  'prescriptions/createPrescription',
  async ({ patientId, medications, pharmacy }) => {
    // Get patient's facility ID
    const patientDoc = await getDoc(doc(db, 'patients', patientId));
    const facilityId = patientDoc.data().facilityId;

    const prescriptionData = {
      patientId,
      medications,
      pharmacy,
      facilityId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
    return { id: docRef.id, ...prescriptionData };
  }
);

export const fetchPatientPrescriptions = createAsyncThunk(
  'prescriptions/fetchPatientPrescriptions',
  async (patientId) => {
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

export const updatePharmacy = createAsyncThunk(
  'prescriptions/updatePharmacy',
  async ({ patientId, pharmacyDetails }) => {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      defaultPharmacy: pharmacyDetails
    });
    return pharmacyDetails;
  }
);

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState: {
    prescriptions: [],
    loading: false,
    error: null
  },
  reducers: {
    clearPrescriptions: (state) => {
      state.prescriptions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions.push(action.payload);
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearPrescriptions } = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;
