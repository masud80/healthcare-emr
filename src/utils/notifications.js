import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Creates a new notification for a user
 * @param {string} userId - The ID of the user to notify
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.type - Either 'action' or 'view'
 * @param {string} notificationData.title - The notification title
 * @param {string} notificationData.message - The notification message
 * @param {string} [notificationData.actionLink] - Optional link for action notifications
 * @param {Object} [notificationData.metadata] - Optional additional data
 */
export const createNotification = async (userId, notificationData) => {
  try {
    const notificationsRef = collection(db, 'AlertsNotifications');
    await addDoc(notificationsRef, {
      userId,
      ...notificationData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Example usage:
/*
// For a view notification (e.g., facility assignment)
createNotification(userId, {
  type: 'view',
  title: 'New Facility Assignment',
  message: 'You have been assigned to Springfield Medical Center',
  metadata: {
    facilityId: 'facility123'
  }
});

// For an action notification (e.g., medication refill)
createNotification(userId, {
  type: 'action',
  title: 'Medication Refill Required',
  message: 'Patient John Doe needs medication refill approval',
  actionLink: '/prescriptions/refill/123',
  metadata: {
    prescriptionId: 'prescription123',
    patientId: 'patient123'
  }
});
*/ 