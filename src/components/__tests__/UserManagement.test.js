import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagement from '../admin/UserManagement';
import { renderWithProviders } from './testUtils';

// Mock window.confirm
window.confirm = jest.fn(() => true);

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user management page for admin users', async () => {
    renderWithProviders(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  test('shows permission denied for non-admin users', () => {
    renderWithProviders(<UserManagement />, {
      preloadedState: {
        auth: {
          user: { uid: 'testUserId', email: 'test@example.com' },
          role: 'doctor',
          loading: false,
          error: null
        }
      }
    });

    expect(screen.getByText('You do not have permission to access this page.')).toBeInTheDocument();
  });

  test('opens add user dialog when clicking Add New User button', async () => {
    renderWithProviders(<UserManagement />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Add New User')).toBeInTheDocument();
    });

    // Click the button
    fireEvent.click(screen.getByText('Add New User'));

    // Check dialog elements
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    renderWithProviders(<UserManagement />, {
      preloadedState: {
        auth: {
          user: { uid: 'testUserId', email: 'test@example.com' },
          role: 'admin',
          loading: false,
          error: 'Failed to fetch users'
        },
        facilities: {
          facilities: [],
          loading: false,
          error: null
        }
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });
});
