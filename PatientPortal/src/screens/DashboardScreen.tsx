import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Appointments',
      screen: 'Appointments',
      description: 'Schedule and view appointments',
    },
    {
      title: 'Past Visits',
      screen: 'Visits',
      description: 'View your visit history',
    },
    {
      title: 'Lab Results',
      screen: 'LabResults',
      description: 'Access your lab results',
    },
    {
      title: 'Payments',
      screen: 'Payments',
      description: 'Make payments and view bills',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome to Patient Portal</Text>
        <Text style={styles.subtitle}>What would you like to do today?</Text>
      </View>
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as never)}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuGrid: {
    padding: 10,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default DashboardScreen;
