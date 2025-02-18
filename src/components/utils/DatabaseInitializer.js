import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { initializeDatabase } from '../../utils/initializeTestData';
import { addAdminRole } from '../../utils/addAdminRole';

const DatabaseInitializer = () => {
  const [open, setOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInitialize = async () => {
    setInitializing(true);
    setError(null);
    setSuccess(false);
    
    try {
      await initializeDatabase();
      await addAdminRole(); // Ensure admin role exists in Firestore
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        Initialize Test Data
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Initialize Test Data</DialogTitle>
        <DialogContent>
          <Typography>
            This will create test users and patients in the database. Use these credentials to log in:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 2 }}>
            <ul>
              <li>Admin: admin@healthcare.com / admin123</li>
              <li>Doctor: doctor@healthcare.com / doctor123</li>
              <li>Nurse: nurse@healthcare.com / nurse123</li>
            </ul>
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {error}
            </Typography>
          )}
          {success && (
            <Typography color="success" sx={{ mt: 2 }}>
              Test data initialized successfully!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInitialize}
            disabled={initializing}
            variant="contained"
          >
            {initializing ? 'Initializing...' : 'Initialize'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatabaseInitializer;
