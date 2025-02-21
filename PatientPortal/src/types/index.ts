export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  details: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
}

export interface LabResult {
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

export interface Payment {
  id: string;
  patientId: string;
  billId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  patientId: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  description: string;
  createdAt: string;
}
