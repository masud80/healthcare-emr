/**
 * Billing utility functions for calculations and data formatting
 */

// Format currency amount with proper decimal places and currency symbol
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate bill totals from items
export const calculateBillTotals = (items, taxRate = 0.1, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Calculate remaining balance
export const calculateRemainingBalance = (totalAmount, payments) => {
  const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return parseFloat((totalAmount - paidAmount).toFixed(2));
};

// Determine bill status based on payments
export const determineBillStatus = (totalAmount, paidAmount) => {
  if (paidAmount >= totalAmount) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
};

// Generate a unique bill number
export const generateBillNumber = (prefix = 'BILL') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate due date based on payment terms
export const calculateDueDate = (createdAt, paymentTerms) => {
  const date = new Date(createdAt);
  switch (paymentTerms) {
    case 'due_on_receipt':
      return date;
    case 'net_15':
      return new Date(date.setDate(date.getDate() + 15));
    case 'net_30':
      return new Date(date.setDate(date.getDate() + 30));
    case 'net_45':
      return new Date(date.setDate(date.getDate() + 45));
    case 'net_60':
      return new Date(date.setDate(date.getDate() + 60));
    default:
      return date;
  }
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get payment method display name
export const getPaymentMethodDisplay = (method) => {
  const methodMap = {
    cash: 'Cash',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    insurance: 'Insurance',
    bank_transfer: 'Bank Transfer',
    check: 'Check',
    other: 'Other'
  };
  return methodMap[method] || method;
};

// Validate bill data before creation or update
export const validateBillData = (billData) => {
  const errors = {};

  if (!billData.patientId) errors.patientId = 'Patient ID is required';
  if (!billData.patientName) errors.patientName = 'Patient name is required';
  if (!billData.items?.length) errors.items = 'At least one item is required';

  billData.items?.forEach((item, index) => {
    if (!item.description) errors[`items.${index}.description`] = 'Description is required';
    if (!item.quantity || item.quantity < 1) errors[`items.${index}.quantity`] = 'Valid quantity is required';
    if (!item.unitPrice || item.unitPrice < 0) errors[`items.${index}.unitPrice`] = 'Valid unit price is required';
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generate payment reference number
export const generatePaymentReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${timestamp}-${random}`;
};

// Calculate aging of bills
export const calculateBillAging = (bills) => {
  const now = new Date();
  const aging = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0
  };

  bills.forEach(bill => {
    if (bill.status === 'paid') return;

    const dueDate = new Date(calculateDueDate(bill.createdAt, bill.paymentTerms));
    const daysPastDue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

    if (daysPastDue <= 0) aging.current += (bill.totalAmount - (bill.paidAmount || 0));
    else if (daysPastDue <= 30) aging['1-30'] += (bill.totalAmount - (bill.paidAmount || 0));
    else if (daysPastDue <= 60) aging['31-60'] += (bill.totalAmount - (bill.paidAmount || 0));
    else if (daysPastDue <= 90) aging['61-90'] += (bill.totalAmount - (bill.paidAmount || 0));
    else aging['90+'] += (bill.totalAmount - (bill.paidAmount || 0));
  });

  return aging;
};

// Filter bills based on criteria
export const filterBills = (bills, filters) => {
  return bills.filter(bill => {
    // Filter by status
    if (filters.status && filters.status !== 'all' && bill.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const billDate = new Date(bill.createdAt);
      if (filters.dateRange.start && billDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && billDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    // Filter by patient
    if (filters.patientId && bill.patientId !== filters.patientId) {
      return false;
    }

    // Filter by facility
    if (filters.facilityId && bill.facilityId !== filters.facilityId) {
      return false;
    }

    return true;
  });
};

// Sort bills by specified criteria
export const sortBills = (bills, sortBy, sortOrder = 'desc') => {
  return [...bills].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
        break;
      case 'amount':
        comparison = b.totalAmount - a.totalAmount;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'patient':
        comparison = a.patientName.localeCompare(b.patientName);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  });
};

// Export all utility functions
export const billingUtils = {
  formatCurrency,
  calculateBillTotals,
  calculateRemainingBalance,
  determineBillStatus,
  generateBillNumber,
  calculateDueDate,
  formatDate,
  getPaymentMethodDisplay,
  validateBillData,
  generatePaymentReference,
  calculateBillAging,
  filterBills,
  sortBills
};

export default billingUtils;
