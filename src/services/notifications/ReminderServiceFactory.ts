import { Platform } from 'react-native';
import { IReminderService } from './IReminderService';
import { ReactNativeReminderService } from './ReactNativeReminderService';


export class ReminderServiceFactory {
  static getService(): IReminderService {
    if (Platform.OS === 'android' && !__DEV__) { // Use Android implementation for production Android builds
      //return AndroidReminderService.getInstance();
    }
    return ReactNativeReminderService.getInstance(); // Use RN implementation for development and other platforms
  }
} 