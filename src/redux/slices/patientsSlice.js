import { createSlice } from '@reduxjs/toolkit';

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
    setPatients: (state, action) => {
      state.patients = action.payload;
    },
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setPatients, setSelectedPatient, setLoading, setError } = patientsSlice.actions;
export default patientsSlice.reducer;
