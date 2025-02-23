import { setUser, setRole, setLoading, setError } from '../slices/authSlice';

export const loginUser = (userData) => async (dispatch) => {
  try {
    // First set loading state
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Then update user data and role separately
    dispatch(setUser({
      uid: userData.uid,
      email: userData.email
    }));
    
    // Explicitly set the role
    dispatch(setRole(userData.role));

    // Finally set loading to false
    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error in loginUser action:', error);
    dispatch(setError('Failed to update user state'));
    dispatch(setLoading(false));
  }
};
