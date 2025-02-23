import * as Notifications from 'expo-notifications';

export class ReminderService {
  private static instance: ReminderService;
  
  private constructor() {}

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  async requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
} 