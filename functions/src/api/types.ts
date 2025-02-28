export interface Organization {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'laboratory' | 'insurance';
  address: Address;
  contact: ContactInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  fax?: string;
}

export interface RecordShare {
  id: string;
  patientId: string;
  recordIds: string[];
  sourceOrganizationId: string;
  recipientOrganizationId: string;
  sharedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface Job {
  id: string;
  type: 'PROCESS_RECORD_SHARE' | 'SYNC_PATIENT_DATA';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
} 