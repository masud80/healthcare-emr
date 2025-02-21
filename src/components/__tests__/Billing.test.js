import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BillingDashboard from '../billing/BillingDashboard';
import BillList from '../billing/BillList';
import CreateBill from '../billing/CreateBill';
import BillDetails from '../billing/BillDetails';

const mockStore = configureStore([thunk]);

// Mock data
const mockBills = [
  {
    id: 'bill1',
    billNumber: 'BILL-001',
    patientName: 'John Doe',
    patientId: 'patient1',
    totalAmount: 500.00,
    paidAmount: 500.00,
    status: 'paid',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'bill2',
    billNumber: 'BILL-002',
    patientName: 'Jane Smith',
    patientId: 'patient2',
    totalAmount: 750.00,
    paidAmount: 250.00,
    status: 'partial',
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

const initialState = {
  billing: {
    bills: mockBills,
    currentBill: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      dateRange: null
    }
  }
};

// Helper function to render components with Redux and Router
const renderWithProviders = (component) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('BillingDashboard', () => {
  it('renders dashboard with summary stats', () => {
    renderWithProviders(<BillingDashboard />);
    
    expect(screen.getByText('Billing Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Billed')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('Total Paid')).toBeInTheDocument();
    expect(screen.getByText('$750.00')).toBeInTheDocument();
  });

  it('shows filter options when filter button is clicked', () => {
    renderWithProviders(<BillingDashboard />);
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
  });
});

describe('BillList', () => {
  it('renders list of bills', () => {
    renderWithProviders(<BillList bills={mockBills} />);
    
    expect(screen.getByText('BILL-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('BILL-002')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows correct status chips', () => {
    renderWithProviders(<BillList bills={mockBills} />);
    
    const paidChip = screen.getByText('paid');
    const partialChip = screen.getByText('partial');
    
    expect(paidChip).toHaveClass('MuiChip-colorSuccess');
    expect(partialChip).toHaveClass('MuiChip-colorWarning');
  });
});

describe('CreateBill', () => {
  it('renders create bill form', () => {
    renderWithProviders(<CreateBill />);
    
    expect(screen.getByText('Create New Bill')).toBeInTheDocument();
    expect(screen.getByLabelText('Patient ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Patient Name')).toBeInTheDocument();
    expect(screen.getByText('Bill Items')).toBeInTheDocument();
  });

  it('allows adding new items', async () => {
    renderWithProviders(<CreateBill />);
    
    const addItemButton = screen.getByText('Add Item');
    fireEvent.click(addItemButton);
    
    const itemRows = screen.getAllByRole('row');
    expect(itemRows.length).toBe(3); // Header row + 2 item rows
  });
});

describe('BillDetails', () => {
  const mockBillWithDetails = {
    ...mockBills[0],
    items: [
      {
        description: 'Consultation',
        quantity: 1,
        unitPrice: 300.00,
        amount: 300.00
      },
      {
        description: 'Lab Test',
        quantity: 1,
        unitPrice: 200.00,
        amount: 200.00
      }
    ],
    subtotal: 500.00,
    tax: 0,
    discount: 0,
    payments: [
      {
        amount: 500.00,
        method: 'credit_card',
        reference: 'PAY-001',
        date: '2023-01-01T00:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    const stateWithCurrentBill = {
      ...initialState,
      billing: {
        ...initialState.billing,
        currentBill: mockBillWithDetails
      }
    };
    const store = mockStore(stateWithCurrentBill);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BillDetails />
        </BrowserRouter>
      </Provider>
    );
  });

  it('renders bill details', () => {
    expect(screen.getByText('Bill Details')).toBeInTheDocument();
    expect(screen.getByText('#BILL-001')).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
    expect(screen.getByText('Lab Test')).toBeInTheDocument();
  });

  it('shows payment history', () => {
    expect(screen.getByText('Payment History')).toBeInTheDocument();
    expect(screen.getByText('credit_card')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('hides payment button for paid bills', () => {
    const processPaymentButton = screen.queryByText('Process Payment');
    expect(processPaymentButton).not.toBeInTheDocument();
  });
});
