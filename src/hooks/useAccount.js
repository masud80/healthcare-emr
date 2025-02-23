import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setProfile, setError } from '../store/slices/accountSlice';
import { getUserProfile, updateUserProfile } from '../firebase/account';
import { auth } from '../firebase/config';
import { updateEmail, updatePassword } from 'firebase/auth';

export const useAccount = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile(auth.currentUser.uid);
      dispatch(setProfile(profile));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (data) => {
    try {
      setLoading(true);
      await updateUserProfile(auth.currentUser.uid, data);
      if (data.email && data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }
      await fetchProfile();
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch, fetchProfile]);

  const changePassword = useCallback(async (newPassword) => {
    try {
      setLoading(true);
      await updatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    loading,
    fetchProfile,
    updateProfile,
    changePassword
  };
};