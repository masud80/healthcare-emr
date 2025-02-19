import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FacilityList from '../facilities/FacilityList';
import { renderWithProviders } from './testUtils';

describe('FacilityList Component CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // READ - Test loading and displaying facilities
  test('loads and displays facilities', async () => {
    renderWithProviders(<FacilityList />);

    await waitFor(() => {
      expect(screen.getByText('Add New Facility')).toBeInTheDocument();
    });
  });

  // CREATE - Test adding a new facility
  test('creates a new facility', async () => {
    renderWithProviders(<FacilityList />);

    // Click add facility button
    fireEvent.click(screen.getByText('Add New Facility'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Facility Name'), {
      target: { value: 'New Test Facility' }
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '123 Test St' }
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '555-555-5555' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText('Facility added successfully')).toBeInTheDocument();
    });
  });

  // UPDATE - Test updating a facility
  test('updates an existing facility', async () => {
    const existingFacility = {
      id: '1',
      name: 'Existing Facility',
      address: '123 Old St',
      phone: '111-111-1111'
    };

    renderWithProviders(<FacilityList />, {
      preloadedState: {
        facilities: {
          facilities: [existingFacility],
          loading: false,
          error: null
        }
      }
    });

    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: 'Edit Facility', exact: false }));

    // Update facility name
    fireEvent.change(screen.getByLabelText('Facility Name'), {
      target: { value: 'Updated Facility' }
    });

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(screen.getByText('Facility updated successfully')).toBeInTheDocument();
    });
  });

  // DELETE - Test deleting a facility
  test('deletes a facility', async () => {
    const facilityToDelete = {
      id: '1',
      name: 'Facility to Delete',
      address: '123 Delete St',
      phone: '999-999-9999'
    };

    renderWithProviders(<FacilityList />, {
      preloadedState: {
        facilities: {
          facilities: [facilityToDelete],
          loading: false,
          error: null
        }
      }
    });

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: 'Delete Facility', exact: false }));

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.getByText('Facility deleted successfully')).toBeInTheDocument();
    });
  });

  // ERROR - Test error handling
  test('handles errors when loading facilities fails', async () => {
    renderWithProviders(<FacilityList />, {
      preloadedState: {
        facilities: {
          facilities: [],
          loading: false,
          error: 'Failed to fetch facilities'
        }
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch facilities')).toBeInTheDocument();
    });
  });
});
