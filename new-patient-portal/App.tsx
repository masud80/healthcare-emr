import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReminderService } from './src/services/ReminderService';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MainApp from './src/screens/MainApp';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerShown: true,
              title: 'Login',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
        ) : (
          <Stack.Screen name="MainApp" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    ReminderService.getInstance().requestNotificationPermission();
  }, []);

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
} 
