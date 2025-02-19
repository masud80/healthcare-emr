import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { assignFacilityToUser } from '../../utils/assignFacilityToUser';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';

const AssignFacilityTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    try {
      setLoading(true);
      setStatus('Running test...');
      
      // First get a facility ID
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      if (facilitiesSnapshot.empty) {
        throw new Error('No facilities found');
      }
      
      const facilityId = facilitiesSnapshot.docs[0].id;
      const facilityName = facilitiesSnapshot.docs[0].data().name;
      const userEmail = 'doctor@healthcare.com';

      // Assign the facility to the user
      await assignFacilityToUser(userEmail, facilityId);
      setStatus(`Successfully assigned facility "${facilityName}" to user ${userEmail}`);
    } catch (error) {
      setStatus(`Test failed: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom>
          Facility Assignment Test
        </Typography>
        <Button 
          variant="contained" 
          onClick={runTest}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Test'}
        </Button>
        {status && (
          <Typography 
            color={status.includes('Successfully') ? 'success.main' : 'error.main'} 
            sx={{ mt: 2 }}
          >
            {status}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default AssignFacilityTest;
