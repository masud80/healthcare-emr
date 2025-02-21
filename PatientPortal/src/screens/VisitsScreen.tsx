import React, { useEffect, useState } from 'react';
import { Visit } from '../types';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const VisitsScreen = () => {
  const [visits, setVisits] = useState<Visit[]>([]);

  const fetchVisits = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const q = query(
        collection(db, 'visits'),
        where('patientId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const visitsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisits(visitsList as Visit[]);
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Visits</Text>
      <ScrollView>
        {visits.map((visit: Visit) => (
          <View key={visit.id} style={styles.visitCard}>
            <Text style={styles.visitDate}>Date: {visit.date}</Text>
            <Text style={styles.visitDetails}>Details: {visit.details}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  visitCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  visitDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default VisitsScreen;
