import React from 'react';
import { Card, Typography, Grid, Button, Divider } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const MyAccount = () => {
  const { user } = useAuth();

  return (
    <Card sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>My Account</Typography>
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Email</Typography>
          <Typography>{user?.email}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Account ID</Typography>
          <Typography>{user?.uid}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Email Verification</Typography>
          <Typography>{user?.emailVerified ? 'Verified' : 'Not Verified'}</Typography>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {/* Add password change handler */}}
          >
            Change Password
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default MyAccount;