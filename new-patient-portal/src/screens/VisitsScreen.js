import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const VisitsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Visits</Text>
        <View style={styles.visitCard}>
          <Text style={styles.emptyText}>No recent visits</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit History</Text>
        <View style={styles.visitCard}>
          <Text style={styles.emptyText}>No visit history available</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit Notes</Text>
        <View style={styles.visitCard}>
          <Text style={styles.emptyText}>No visit notes available</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  visitCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default VisitsScreen;
