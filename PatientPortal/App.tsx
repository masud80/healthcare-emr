import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import VisitsScreen from './src/screens/VisitsScreen';
import LabResultsScreen from './src/screens/LabResultsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Patient Dashboard' }}
          />
          <Stack.Screen 
            name="Appointments" 
            component={AppointmentsScreen}
            options={{ title: 'My Appointments' }}
          />
          <Stack.Screen 
            name="Visits" 
            component={VisitsScreen}
            options={{ title: 'Past Visits' }}
          />
          <Stack.Screen 
            name="LabResults" 
            component={LabResultsScreen}
            options={{ title: 'Lab Results' }}
          />
          <Stack.Screen 
            name="Payments" 
            component={PaymentsScreen}
            options={{ title: 'Payments' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
