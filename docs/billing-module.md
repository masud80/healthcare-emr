# Billing Module Documentation

## Overview
The billing module provides comprehensive billing management functionality for the healthcare EMR system. It allows users to create, track, and manage bills, process payments, and generate reports.

## Features
- Create and manage bills
- Track payment status
- Process payments
- Generate billing reports
- Filter and search bills
- Role-based access control
- Integration with patient records

## Components

### BillingDashboard
The main interface for the billing module. Displays:
- Summary statistics (total billed, paid, pending)
- Bills status overview
- Filterable list of bills
- Quick actions (create bill, process payment)

### CreateBill
Form interface for creating new bills:
- Patient selection
- Service item management
- Tax and discount handling
- Payment terms configuration
- Notes and additional information

### BillDetails
Detailed view of individual bills:
- Bill information
- Items breakdown
- Payment history
- Actions (process payment, print, email)

### BillList
Reusable component for displaying bills with:
- Sorting capabilities
- Status indicators
- Payment information
- Action buttons

## Data Structure

### Bill Object
```typescript
interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  paymentTerms: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  payments: Payment[];
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  amount: number;
  method: string;
  reference: string;
  date: string;
}
```

## Redux Integration

### State Structure
```typescript
interface BillingState {
  bills: Bill[];
  currentBill: Bill | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    dateRange: {
      start: string | null;
      end: string | null;
    } | null;
  };
}
```

### Available Actions
- `fetchBills`: Load all bills
- `fetchBillById`: Load specific bill
- `createBill`: Create new bill
- `updateBill`: Update existing bill
- `processPayment`: Process payment for a bill
- `setFilters`: Update bill list filters

## Security Rules

### Firestore Rules
```javascript
match /bills/{billId} {
  allow read: if isAuthenticated() && (
    hasRole('admin') || 
    hasRole('doctor') || 
    hasRole('nurse') ||
    hasRole('billing') ||
    isOwner(resource.data.patientId)
  );
  allow create: if isAuthenticated() && (
    hasRole('admin') || 
    hasRole('billing')
  );
  allow update: if isAuthenticated() && (
    hasRole('admin') || 
    hasRole('billing')
  );
  allow delete: if isAuthenticated() && hasRole('admin');
}
```

## Role-Based Access

### Available Roles
- `admin`: Full access to all billing features
- `billing`: Create and manage bills, process payments
- `doctor`: View bills and payment status
- `nurse`: View bills and payment status

### Permissions Matrix
| Action           | Admin | Billing | Doctor | Nurse |
|-----------------|-------|---------|---------|-------|
| View Bills      | ✓     | ✓       | ✓       | ✓     |
| Create Bills    | ✓     | ✓       | ✗       | ✗     |
| Process Payment | ✓     | ✓       | ✗       | ✗     |
| Delete Bills    | ✓     | ✗       | ✗       | ✗     |

## Usage Examples

### Creating a New Bill
```javascript
import { createBill } from '../redux/thunks/billingThunks';

const newBill = {
  patientId: 'patient123',
  patientName: 'John Doe',
  items: [
    {
      description: 'Consultation',
      quantity: 1,
      unitPrice: 150.00,
      amount: 150.00
    }
  ],
  // ... other bill details
};

dispatch(createBill(newBill));
```

### Processing a Payment
```javascript
import { processPayment } from '../redux/thunks/billingThunks';

const paymentDetails = {
  amount: 150.00,
  method: 'credit_card',
  reference: `PAY-${Date.now()}`
};

dispatch(processPayment(billId, paymentDetails));
```

## Integration Points

### Patient Module
- Bills are linked to patient records via `patientId`
- Patient billing history available in patient details
- Automatic bill creation from visits/procedures

### Facility Module
- Bills are associated with facilities via `facilityId`
- Facility-specific billing reports
- Facility-level billing settings

### Reporting Module
- Billing statistics and trends
- Revenue reports
- Outstanding payments tracking
- Payment collection analysis

## Best Practices

1. **Bill Creation**
   - Verify patient information before creating bills
   - Double-check service items and amounts
   - Include detailed descriptions for transparency
   - Set appropriate payment terms

2. **Payment Processing**
   - Verify payment amount against remaining balance
   - Document payment method and reference
   - Update payment status immediately
   - Generate payment receipts

3. **Security**
   - Always verify user permissions
   - Maintain audit trail of billing actions
   - Secure sensitive payment information
   - Regular backup of billing data

## Troubleshooting

### Common Issues
1. **Bill Creation Fails**
   - Check patient ID exists
   - Verify all required fields
   - Confirm user permissions

2. **Payment Processing Errors**
   - Verify payment amount
   - Check payment method validity
   - Confirm bill status

3. **Report Generation Issues**
   - Check date range validity
   - Verify data availability
   - Confirm filter settings

## Future Enhancements
- Insurance provider integration
- Automated payment reminders
- Payment gateway integration
- Advanced reporting features
- Mobile payment support
- Multi-currency support
