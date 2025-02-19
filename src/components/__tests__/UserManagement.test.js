import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagement from '../admin/UserManagement';
import { renderWithProviders } from './testUtils';

describe('UserManagement Component CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // READ - Test loading and displaying users
  test('loads and displays users', async () => {
    renderWithProviders(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add New User')).toBeInTheDocument();
    });
  });

  // CREATE - Test adding a new user
  test('creates a new user', async () => {
    renderWithProviders(<UserManagement />);

    // Click add user button
    fireEvent.click(screen.getByText('Add New User'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newuser@test.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: 'doctor' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText('User added successfully')).toBeInTheDocument();
    });
  });

  // UPDATE - Test updating a user
  test('updates an existing user', async () => {
    const existingUser = {
      id: '1',
      email: 'existing@test.com',
      role: 'nurse',
      facilities: []
    };

    renderWithProviders(<UserManagement />, {
      preloadedState: {
        users: {
          users: [existingUser],
          loading: false,
          error: null
        }
      }
    });

    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: 'Edit User', exact: false }));

    // Update user role
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: 'doctor' }
    });

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(screen.getByText('User updated successfully')).toBeInTheDocument();
    });
  });

  // DELETE - Test deleting a user
  test('deletes a user', async () => {
    const userToDelete = {
      id: '1',
      email: 'delete@test.com',
      role: 'nurse',
      facilities: []
    };

    renderWithProviders(<UserManagement />, {
      preloadedState: {
        users: {
          users: [userToDelete],
          loading: false,
          error: null
        }
      }
    });

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: 'Delete User', exact: false }));

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.getByText('User deleted successfully')).toBeInTheDocument();
    });
  });

  // ERROR - Test error handling
  test('handles errors when loading users fails', async () => {
    renderWithProviders(<UserManagement />, {
      preloadedState: {
        users: {
          users: [],
          loading: false,
          error: 'Failed to fetch users'
        }
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });
});
