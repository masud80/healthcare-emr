import React from 'react';
import { Container, Typography } from '@mui/material';
import PatientList from '../components/patients/PatientList';

export default function MainApp() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Patients
      </Typography>
      <PatientList />
    </Container>
  );
} 