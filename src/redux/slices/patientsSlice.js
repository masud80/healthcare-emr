import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchPatientDetails = createAsyncThunk(
  'patients/fetchPatientDetails',
  async (patientId) => {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Patient not found');
    }
    return { id: docSnap.id, ...docSnap.data() };
  }
);

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async () => {
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch patient details
      .addCase(fetchPatientDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedPatient } = patientsSlice.actions;
export default patientsSlice.reducer;
