import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LabResultsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Lab Results</Text>
        <View style={styles.resultCard}>
          <Text style={styles.emptyText}>No recent lab results</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Tests</Text>
        <View style={styles.resultCard}>
          <Text style={styles.emptyText}>No pending tests</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab History</Text>
        <View style={styles.resultCard}>
          <Text style={styles.emptyText}>No lab history available</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Lab results are typically available within 24-48 hours after testing.
          Contact your healthcare provider for urgent results.
        </Text>
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
  resultCard: {
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
  infoSection: {
    padding: 20,
    backgroundColor: '#e8f4ff',
    margin: 20,
    borderRadius: 10,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default LabResultsScreen;
