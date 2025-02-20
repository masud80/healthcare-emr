import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientList from '../patients/PatientList';
import { renderWithProviders } from '../testUtils';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientList Component', () => {
  const mockPatients = [
    { 
      id: '1', 
      name: 'John Doe',
      dateOfBirth: '1990-01-01',
      contact: '123-456-7890',
      lastVisit: '2023-01-01'
    },
    { 
      id: '2', 
      name: 'Jane Smith',
      dateOfBirth: '1985-05-15',
      contact: '098-765-4321',
      lastVisit: '2023-02-01'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays patients', async () => {
    getDocs.mockResolvedValueOnce({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient
      }))
    });

    renderWithProviders(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    renderWithProviders(<PatientList />, {
      preloadedState: {
        auth: { user: null, loading: false, error: null },
        facilities: { facilities: [], loading: false, error: null },
        patients: { patients: [], loading: true, error: null }
      }
    });
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('displays error state', () => {
    renderWithProviders(<PatientList />, {
      preloadedState: {
        auth: { user: null, loading: false, error: null },
        facilities: { facilities: [], loading: false, error: null },
        patients: { patients: [], loading: false, error: 'Failed to load patients' }
      }
    });

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  test('filters patients by search term', async () => {
    getDocs.mockResolvedValueOnce({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient
      }))
    });

    renderWithProviders(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search patients by name or id/i), {
      target: { value: 'Jane' }
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('navigates to add patient page', () => {
    renderWithProviders(<PatientList />);
    fireEvent.click(screen.getByText('Add New Patient'));
    expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
  });

  test('navigates to edit patient page', async () => {
    getDocs.mockResolvedValueOnce({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient
      }))
    });

    renderWithProviders(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('edit-patient-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/patients/1/edit');
  });

  test('deletes a patient', async () => {
    getDocs.mockResolvedValueOnce({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient
      }))
    });

    doc.mockReturnValue('patientRef');
    renderWithProviders(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('delete-patient-1'));
    expect(deleteDoc).toHaveBeenCalledWith('patientRef');
  });
});
