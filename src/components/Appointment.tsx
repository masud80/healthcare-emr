import React, { useEffect } from 'react';
import { ReminderService } from '../services/ReminderService';

export const Appointment: React.FC<AppointmentProps> = ({ appointment }) => {
  useEffect(() => {
    const reminderService = ReminderService.getInstance();
    reminderService.requestNotificationPermission();
    reminderService.scheduleReminder(appointment);
  }, [appointment]);

  return (
    <div className="appointment-card">
      // ... existing appointment display code ...
      <button 
        className="reminder-button"
        onClick={() => ReminderService.getInstance().scheduleReminder(appointment)}
      >
        Set Reminder
      </button>
    </div>
  );
}; 