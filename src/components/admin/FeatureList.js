import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const FeatureList = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [open, setOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    key: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const featuresRef = collection(db, 'features');
      const snapshot = await getDocs(featuresRef);
      const featuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeatures(featuresData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching features:', error);
      setLoading(false);
    }
  };

  const handleAddFeature = async () => {
    try {
      const featuresRef = collection(db, 'features');
      await addDoc(featuresRef, {
        ...newFeature,
        createdAt: new Date(),
        enabled: true
      });
      setOpen(false);
      setNewFeature({ name: '', description: '', key: '' });
      fetchFeatures();
    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  const handleConfigure = (featureId) => {
    navigate(`/admin/features/${featureId}/configure`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Feature Configuration</h1>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add New Feature
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.name}</TableCell>
                <TableCell>{feature.key}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>{feature.enabled ? 'Enabled' : 'Disabled'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleConfigure(feature.id)}
                  >
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Feature</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feature Name"
            fullWidth
            value={newFeature.name}
            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Feature Key"
            fullWidth
            value={newFeature.key}
            onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            helperText="This will be used in code to check if feature is enabled"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newFeature.description}
            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFeature} color="primary">
            Add Feature
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FeatureList; 