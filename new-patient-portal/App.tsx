import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReminderService } from './src/services/ReminderService';
// ... other imports

// Import your screens
import MainApp from './src/screens/MainApp'; // Make sure this file exists

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Request notification permissions when app starts
    ReminderService.getInstance().requestNotificationPermission();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainApp" 
          component={MainApp}
          options={{ title: 'Patient Portal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 