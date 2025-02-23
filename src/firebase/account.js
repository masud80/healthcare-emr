import { db } from './config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const getUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserProfile = async (userId, data) => {
  await updateDoc(doc(db, 'users', userId), data);
};