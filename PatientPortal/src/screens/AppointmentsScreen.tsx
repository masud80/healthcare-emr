import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AppointmentsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const handleScheduleAppointment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        date,
        time,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setDate('');
      setTime('');
      setReason('');
      setModalVisible(false);
      
      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const appointmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsList as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.scheduleButtonText}>Schedule New Appointment</Text>
      </TouchableOpacity>

      <ScrollView style={styles.appointmentsList}>
        {appointments.map((appointment: Appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <Text style={styles.appointmentDate}>Date: {appointment.date}</Text>
            <Text style={styles.appointmentTime}>Time: {appointment.time}</Text>
            <Text style={styles.appointmentReason}>
              Reason: {appointment.reason}
            </Text>
            <Text style={styles.appointmentStatus}>
              Status: {appointment.status}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Appointment</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Date (MM/DD/YYYY)"
              value={date}
              onChangeText={setDate}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Time"
              value={time}
              onChangeText={setTime}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Reason for visit"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleScheduleAppointment}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
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
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appointmentTime: {
    fontSize: 14,
    marginBottom: 5,
  },
  appointmentReason: {
    fontSize: 14,
    marginBottom: 5,
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#666',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;
