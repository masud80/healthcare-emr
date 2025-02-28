import { createNotification } from './notifications';

/**
 * Creates a facility assignment notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} facilityName - The name of the facility
 * @param {string} facilityId - The ID of the facility
 */
export const createFacilityAssignmentNotification = async (userId, facilityName, facilityId) => {
  await createNotification(userId, {
    type: 'view',
    title: 'New Facility Assignment',
    message: `You have been assigned to ${facilityName}`,
    metadata: {
      facilityId
    }
  });
};

/**
 * Creates a medication refill notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} patientName - The name of the patient
 * @param {string} prescriptionId - The ID of the prescription
 * @param {string} patientId - The ID of the patient
 */
export const createMedicationRefillNotification = async (userId, patientName, prescriptionId, patientId) => {
  await createNotification(userId, {
    type: 'action',
    title: 'Medication Refill Required',
    message: `Patient ${patientName} needs medication refill approval`,
    actionLink: `/prescriptions/refill/${prescriptionId}`,
    metadata: {
      prescriptionId,
      patientId
    }
  });
};

/**
 * Creates a new message notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} senderName - The name of the message sender
 * @param {string} threadId - The ID of the message thread
 */
export const createNewMessageNotification = async (userId, senderName, threadId) => {
  await createNotification(userId, {
    type: 'action',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    actionLink: `/messaging/${threadId}`,
    metadata: {
      threadId
    }
  });
};

/**
 * Creates a new appointment notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} patientName - The name of the patient
 * @param {string} appointmentId - The ID of the appointment
 * @param {Date} appointmentDate - The date of the appointment
 */
export const createAppointmentNotification = async (userId, patientName, appointmentId, appointmentDate) => {
  await createNotification(userId, {
    type: 'action',
    title: 'New Appointment',
    message: `New appointment scheduled with ${patientName} on ${appointmentDate.toLocaleDateString()}`,
    actionLink: `/appointments/${appointmentId}`,
    metadata: {
      appointmentId
    }
  });
}; 