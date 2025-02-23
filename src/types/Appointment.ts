export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  dateTime: Date;
  duration: number;
  reminderSet?: boolean;
} 