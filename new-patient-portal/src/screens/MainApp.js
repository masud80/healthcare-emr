import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import HomeScreen from './HomeScreen';
import AppointmentsScreen from './AppointmentsScreen';
import VisitsScreen from './VisitsScreen';
import LabResultsScreen from './LabResultsScreen';
import PaymentsScreen from './PaymentsScreen';
import MyAccountScreen from './MyAccountScreen';

const Tab = createBottomTabNavigator();

export default function MainApp({ navigation }) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 15 }}
          >
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Visits" 
        component={VisitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Lab Results" 
        component={LabResultsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="test-tube" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="My Account" 
        component={MyAccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
