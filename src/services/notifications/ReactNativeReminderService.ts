import { Appointment } from '../../types/Appointment';
import { IReminderService } from './IReminderService';
import { Platform } from 'react-native';

export class ReactNativeReminderService implements IReminderService {
  private static instance: ReactNativeReminderService;

  private constructor() {}

  public static getInstance(): ReactNativeReminderService {
    if (!ReactNativeReminderService.instance) {
      ReactNativeReminderService.instance = new ReactNativeReminderService();
    }
    return ReactNativeReminderService.instance;
  }

  public async scheduleReminder(appointment: Appointment): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use setTimeout since web notifications are shown immediately
        const reminderTime = new Date(appointment.dateTime);
        const timeUntilReminder = reminderTime.getTime() - Date.now() - (24 * 60 * 60 * 1000);
        
        setTimeout(() => {
          if ('Notification' in window) {
            new Notification('Appointment Reminder', {
              body: `You have an appointment with Dr. ${appointment.doctorName} tomorrow at ${new Date(appointment.dateTime).toLocaleTimeString()}`,
            });
          }
        }, timeUntilReminder);
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
} 