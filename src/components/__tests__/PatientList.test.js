import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientList from '../patients/PatientList';
import { renderWithProviders, mockPatient } from './testUtils';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn()
}));

describe('PatientList Component CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // READ - Test loading and displaying patients
  test('loads and displays patients', async () => {
    const mockPatients = [
      { 
        id: '1', 
        name: 'John Doe', 
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        phone: '123-456-7890'
      },
      { 
        id: '2', 
        name: 'Jane Smith', 
        email: 'jane@example.com',
        dateOfBirth: '1985-05-15',
        phone: '098-765-4321'
      }
    ];

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
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  // CREATE - Test adding a new patient
  test('creates a new patient', async () => {
    const newPatient = {
      name: 'New Patient',
      email: 'newpatient@example.com',
      dateOfBirth: '1995-03-20',
      phone: '555-555-5555'
    };

    addDoc.mockResolvedValueOnce({ id: '3' });
    getDocs.mockResolvedValueOnce({ docs: [] });

    renderWithProviders(<PatientList />);

    // Click add patient button
    fireEvent.click(screen.getByText('Add Patient'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: newPatient.name }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: newPatient.email }
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: newPatient.dateOfBirth }
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: newPatient.phone }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: newPatient.name,
          email: newPatient.email,
          dateOfBirth: newPatient.dateOfBirth,
          phone: newPatient.phone
        })
      );
    });
  });

  // UPDATE - Test updating a patient
  test('updates an existing patient', async () => {
    const existingPatient = {
      id: '1',
      name: 'Existing Patient',
      email: 'existing@example.com',
      dateOfBirth: '1980-12-25',
      phone: '111-111-1111'
    };

    getDocs.mockResolvedValueOnce({
      docs: [{
        id: existingPatient.id,
        data: () => existingPatient
      }]
    });

    renderWithProviders(<PatientList />);

    await waitFor(() => {
      expect(screen.getByText(existingPatient.name)).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByTestId(`edit-patient-${existingPatient.id}`));

    // Update patient name
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Patient Name' }
    });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Updated Patient Name'
        })
      );
    });
  });

  // DELETE - Test deleting a patient
  test('deletes a patient', async () => {
    const patientToDelete = {
      id: '1',
      name: 'Patient to Delete',
      email: 'delete@example.com',
      dateOfBirth: '1975-06-15',
      phone: '999-999-9999'
    };

    getDocs.mockResolvedValueOnce({
      docs: [{
        id: patientToDelete.id,
        data: () => patientToDelete
      }]
    });

    renderWithProviders(<PatientList />);

    await waitFor(() => {
      expect(screen.getByText(patientToDelete.name)).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId(`delete-patient-${patientToDelete.id}`));

    // Confirm deletion
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  // Error Handling
  test('handles errors when loading patients fails', async () => {
    getDocs.mockRejectedValueOnce(new Error('Failed to load patients'));

    renderWithProviders(<PatientList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading patients/i)).toBeInTheDocument();
    });
  });

  // Test patient search functionality
  test('filters patients by search term', async () => {
    const mockPatients = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

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

    // Type in search field
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Jane' }
    });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
