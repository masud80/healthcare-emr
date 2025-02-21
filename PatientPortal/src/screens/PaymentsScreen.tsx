import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

interface Bill {
  id: string;
  patientId: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  description: string;
  createdAt: string;
}

const PaymentsScreen = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchBillsAndPayments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      // Fetch bills
      const billsQuery = query(
        collection(db, 'bills'),
        where('patientId', '==', user.uid)
      );
      const billsSnapshot = await getDocs(billsQuery);
      const billsList = billsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Bill[];
      setBills(billsList);

      // Fetch payments
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('patientId', '==', user.uid)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsList = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      setPayments(paymentsList);
    } catch (error) {
      console.error('Error fetching bills and payments:', error);
    }
  };

  useEffect(() => {
    fetchBillsAndPayments();
  }, []);

  const handleMakePayment = async () => {
    try {
      if (!selectedBill) return;

      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      // Create payment record
      await addDoc(collection(db, 'payments'), {
        patientId: user.uid,
        billId: selectedBill.id,
        amount,
        date: new Date().toISOString(),
        status: 'completed',
        description: `Payment for bill ${selectedBill.id}`,
        createdAt: new Date().toISOString(),
      });

      setModalVisible(false);
      setSelectedBill(null);
      setPaymentAmount('');
      fetchBillsAndPayments();

      Alert.alert('Success', 'Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bills & Payments</Text>

      <Text style={styles.sectionTitle}>Outstanding Bills</Text>
      <ScrollView style={styles.billsSection}>
        {bills.filter(bill => bill.status !== 'paid').map((bill) => (
          <TouchableOpacity
            key={bill.id}
            style={styles.billCard}
            onPress={() => {
              setSelectedBill(bill);
              setPaymentAmount(bill.amount.toString());
              setModalVisible(true);
            }}>
            <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
            <Text style={styles.billDueDate}>Due: {bill.dueDate}</Text>
            <Text style={styles.billDescription}>{bill.description}</Text>
            <Text style={[
              styles.billStatus,
              { color: bill.status === 'overdue' ? '#f44336' : '#ff9800' }
            ]}>
              {bill.status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Recent Payments</Text>
      <ScrollView style={styles.paymentsSection}>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <Text style={styles.paymentAmount}>${payment.amount.toFixed(2)}</Text>
            <Text style={styles.paymentDate}>Date: {payment.date}</Text>
            <Text style={styles.paymentStatus}>
              Status: {payment.status.toUpperCase()}
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
            <Text style={styles.modalTitle}>Make Payment</Text>
            {selectedBill && (
              <>
                <Text style={styles.modalText}>
                  Bill Amount: ${selectedBill.amount.toFixed(2)}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter payment amount"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.payButton]}
                    onPress={handleMakePayment}>
                    <Text style={styles.buttonText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  billsSection: {
    maxHeight: '40%',
  },
  paymentsSection: {
    maxHeight: '40%',
  },
  billCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  billAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  billDueDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  billDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  billStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  paymentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  modalText: {
    fontSize: 16,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
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
  payButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentsScreen;
