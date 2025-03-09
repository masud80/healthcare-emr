import { Timestamp } from 'firebase/firestore';

export type MedicalCodeType = 'SNOMED' | 'LOINC' | 'OTHER';

export interface MedicalCode {
  code: string;
  type: MedicalCodeType;
  description: string;
}

export type ItemCategory = 'MEDICATION' | 'SURGICAL_TOOL' | 'PPE' | 'CONSUMABLE' | 'EQUIPMENT' | 'OTHER';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  unit: string;
  minStockLevel: number;
  reorderPoint: number;
  medicalCodes: MedicalCode[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  batchNumber: string;
  expiryDate: Timestamp;
  manufacturingDate: Timestamp;
  quantity: number;
  cost: number;
  locationId: string;
  supplierId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'EXPIRED' | 'DAMAGED';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  batchId: string;
  type: TransactionType;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  reference?: string;
  notes: string;
  performedBy: string;
  performedAt: Timestamp;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  registrationNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  expectedDeliveryDate: Timestamp;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InventoryLocation {
  id: string;
  name: string;
  description: string;
  facilityId: string;
  type: 'WAREHOUSE' | 'PHARMACY' | 'STORAGE' | 'OTHER';
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 