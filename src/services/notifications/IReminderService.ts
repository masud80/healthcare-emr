import { Appointment } from '../../types/Appointment';

export interface IReminderService {
  scheduleReminder(appointment: Appointment): Promise<void>;
  requestNotificationPermission(): Promise<boolean>;
} 