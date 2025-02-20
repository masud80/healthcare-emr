import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { setFacilities, setUserFacilities, setLoading, setError } from '../slices/facilitiesSlice';

export const fetchUserFacilities = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    const user = auth.currentUser;
    if (!user) {
      dispatch(setUserFacilities([]));
      return;
    }

    // Get user's facility assignments
    const userFacilitiesQuery = query(
      collection(db, 'userFacilities'),
      where('userId', '==', user.uid)
    );
    const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);
    const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);

    // Get facility details for assigned facilities
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    const userFacilities = facilitiesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(facility => facilityIds.includes(facility.id));

    dispatch(setUserFacilities(userFacilities));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const fetchFacilities = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    const allFacilities = facilitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    dispatch(setFacilities(allFacilities));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const addFacility = (facilityData) => async (dispatch) => {
  try {
    dispatch(setLoading());
    await addDoc(collection(db, 'facilities'), facilityData);
    dispatch(fetchFacilities());
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const updateFacility = (facilityId, facilityData) => async (dispatch) => {
  try {
    dispatch(setLoading());
    await updateDoc(doc(db, 'facilities', facilityId), facilityData);
    dispatch(fetchFacilities());
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const deleteFacility = (facilityId) => async (dispatch) => {
  try {
    dispatch(setLoading());
    await deleteDoc(doc(db, 'facilities', facilityId));
    dispatch(fetchFacilities());
  } catch (error) {
    dispatch(setError(error.message));
  }
};
