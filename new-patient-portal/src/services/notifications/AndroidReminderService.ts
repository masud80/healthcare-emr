import { Appointment } from '../../types/Appointment';
import { IReminderService } from '../../../../src/services/notifications/IReminderService';
import * as Notifications from 'expo-notifications';

export class AndroidReminderService implements IReminderService {
  private static instance: AndroidReminderService;

  private constructor() {}

  public static getInstance(): AndroidReminderService {
    if (!AndroidReminderService.instance) {
      AndroidReminderService.instance = new AndroidReminderService();
    }
    return AndroidReminderService.instance;
  }

  public async scheduleReminder(appointment: Appointment): Promise<void> {
    try {
      const reminderTime = new Date(appointment.dateTime);
      reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Appointment Reminder',
          body: `You have an appointment with Dr. ${appointment.doctorName} tomorrow at ${new Date(appointment.dateTime).toLocaleTimeString()}`,
          data: { appointmentId: appointment.id },
        },
        trigger: {
          date: reminderTime,
          type: Notifications.SchedulableTriggerInputTypes.DATE
        },
      });
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      const existingPermission = await Notifications.getPermissionsAsync();
      let finalStatus = existingPermission.granted;
      
      if (!finalStatus) {
        const newPermission = await Notifications.requestPermissionsAsync();
        finalStatus = newPermission.granted;
      }
      
      return finalStatus;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
} 