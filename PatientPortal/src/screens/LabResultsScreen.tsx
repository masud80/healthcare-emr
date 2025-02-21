import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  result: string;
  normalRange: string;
  status: 'normal' | 'abnormal';
  notes: string;
  createdAt: string;
}

const LabResultsScreen = () => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLabResults = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const q = query(
        collection(db, 'labResults'),
        where('patientId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const resultsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LabResult[];
      
      setLabResults(resultsList);
    } catch (error) {
      console.error('Error fetching lab results:', error);
    }
  };

  useEffect(() => {
    fetchLabResults();
  }, []);

  const handleResultPress = (result: LabResult) => {
    setSelectedResult(result);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab Results</Text>
      <ScrollView>
        {labResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.resultCard}
            onPress={() => handleResultPress(result)}>
            <Text style={styles.testName}>{result.testName}</Text>
            <Text style={styles.testDate}>Date: {result.testDate}</Text>
            <Text style={[
              styles.status,
              { color: result.status === 'normal' ? '#4CAF50' : '#f44336' }
            ]}>
              Status: {result.status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedResult && (
              <>
                <Text style={styles.modalTitle}>{selectedResult.testName}</Text>
                <Text style={styles.modalText}>Date: {selectedResult.testDate}</Text>
                <Text style={styles.modalText}>Result: {selectedResult.result}</Text>
                <Text style={styles.modalText}>Normal Range: {selectedResult.normalRange}</Text>
                <Text style={styles.modalText}>Notes: {selectedResult.notes}</Text>
                <Text style={[
                  styles.modalStatus,
                  { color: selectedResult.status === 'normal' ? '#4CAF50' : '#f44336' }
                ]}>
                  Status: {selectedResult.status}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LabResultsScreen;
