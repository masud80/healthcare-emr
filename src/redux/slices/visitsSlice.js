import { createSlice } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const initialState = {
  visits: [],
  selectedVisit: null,
  recentVisits: [],
  loading: false,
  error: null
};

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    setVisits: (state, action) => {
      state.visits = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedVisit: (state, action) => {
      state.selectedVisit = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRecentVisits: (state, action) => {
      state.recentVisits = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setVisits,
  setSelectedVisit,
  setRecentVisits,
  setLoading,
  setError
} = visitsSlice.actions;

// Thunks
export const createVisit = (visitData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const visitsRef = collection(db, 'visits');
    const docRef = await addDoc(visitsRef, {
      ...visitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const newVisit = await getDoc(docRef);
    dispatch(setSelectedVisit({ id: newVisit.id, ...newVisit.data() }));
    return { id: newVisit.id, ...newVisit.data() };
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const fetchPatientVisits = (patientId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const visitsRef = collection(db, 'visits');
    const q = query(
      visitsRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const visits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setVisits(visits));
  } catch (error) {
    console.error('Error fetching visits:', error);
    if (error.code === 'permission-denied') {
      dispatch(setError('Permission denied. Please ensure you are logged in with proper permissions.'));
    } else {
      dispatch(setError(`Failed to fetch visits: ${error.message}`));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchRecentVisits = (patientId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const visitsRef = collection(db, 'visits');
    const q = query(
      visitsRef,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const visits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setRecentVisits(visits));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const fetchVisitById = (visitId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const visitRef = doc(db, 'visits', visitId);
    const visitDoc = await getDoc(visitRef);
    if (visitDoc.exists()) {
      dispatch(setSelectedVisit({ id: visitDoc.id, ...visitDoc.data() }));
    } else {
      dispatch(setError('Visit not found'));
    }
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default visitsSlice.reducer;
