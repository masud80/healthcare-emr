import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockFacility } from './testUtils';
import FacilityList from '../facilities/FacilityList';
import { fetchFacilities, addFacility, updateFacility, deleteFacility } from '../../redux/slices/facilitiesSlice';

// Mock the redux dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

describe('FacilityList Component CRUD Operations', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('loads and displays facilities', async () => {
    const facilities = [mockFacility];
    const preloadedState = {
      facilities: {
        facilities,
        loading: false,
        error: null
      }
    };

    renderWithProviders(<FacilityList />, { preloadedState });

    expect(screen.getByText(mockFacility.name)).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('creates a new facility', async () => {
    const preloadedState = {
      facilities: {
        facilities: [],
        loading: false,
        error: null
      },
      auth: {
        user: { role: 'admin' }
      }
    };

    renderWithProviders(<FacilityList />, { preloadedState });

    // Click add button and fill form
    fireEvent.click(screen.getByText('Add Facility'));
    
    const nameInput = screen.getByLabelText('Name');
    const addressInput = screen.getByLabelText('Address');
    const phoneInput = screen.getByLabelText('Phone');

    fireEvent.change(nameInput, { target: { value: mockFacility.name } });
    fireEvent.change(addressInput, { target: { value: mockFacility.address } });
    fireEvent.change(phoneInput, { target: { value: mockFacility.phone } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('updates an existing facility', async () => {
    const facilities = [mockFacility];
    const preloadedState = {
      facilities: {
        facilities,
        loading: false,
        error: null
      },
      auth: {
        user: { role: 'admin' }
      }
    };

    renderWithProviders(<FacilityList />, { preloadedState });

    // Click edit button
    fireEvent.click(screen.getByTestId(`edit-facility-${mockFacility.id}`));

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Facility' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('deletes a facility', async () => {
    const facilities = [mockFacility];
    const preloadedState = {
      facilities: {
        facilities,
        loading: false,
        error: null
      },
      auth: {
        user: { role: 'admin' }
      }
    };

    renderWithProviders(<FacilityList />, { preloadedState });

    // Click delete button
    fireEvent.click(screen.getByTestId(`delete-facility-${mockFacility.id}`));
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('handles errors when loading facilities fails', async () => {
    const preloadedState = {
      facilities: {
        facilities: [],
        loading: false,
        error: 'Failed to load facilities'
      }
    };

    renderWithProviders(<FacilityList />, { preloadedState });

    expect(screen.getByText('Failed to load facilities')).toBeInTheDocument();
  });
});
