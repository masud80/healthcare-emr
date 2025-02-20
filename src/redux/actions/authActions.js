import { setUser, setLoading, setError } from '../slices/authSlice';

export const loginUser = (userData) => async (dispatch) => {
  try {
    // First set loading state
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Then update user data
    dispatch(setUser({
      uid: userData.uid,
      email: userData.email,
      role: userData.role
    }));

    // Finally set loading to false
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError('Failed to update user state'));
    dispatch(setLoading(false));
  }
};
