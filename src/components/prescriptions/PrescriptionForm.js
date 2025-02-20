import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createPrescription, updatePharmacy } from '../../redux/slices/prescriptionsSlice';

const emptyMedication = {
  name: '',
  dosage: '',
  route: '',
  frequency: '',
  duration: ''
};

const routeOptions = [
  'Oral',
  'Intravenous',
  'Intramuscular',
  'Subcutaneous',
  'Topical',
  'Inhalation'
];

const PrescriptionForm = ({ patientId, defaultPharmacy, onClose }) => {
  const dispatch = useDispatch();
  const [medications, setMedications] = useState([{ ...emptyMedication }]);
  const [pharmacy, setPharmacy] = useState(defaultPharmacy || { name: '', address: '', phone: '' });
  const [showPharmacyDialog, setShowPharmacyDialog] = useState(false);

  const handleAddMedication = () => {
    setMedications([...medications, { ...emptyMedication }]);
  };

  const handleRemoveMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value
    };
    setMedications(newMedications);
  };

  const handlePharmacyUpdate = () => {
    dispatch(updatePharmacy({ patientId, pharmacyDetails: pharmacy }));
    setShowPharmacyDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createPrescription({
      patientId,
      medications,
      pharmacy
    }));
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pharmacy Information
        </Typography>
        {pharmacy.name ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>
              {pharmacy.name} - {pharmacy.address}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setShowPharmacyDialog(true)}
            >
              Update Pharmacy
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowPharmacyDialog(true)}
          >
            Add Pharmacy
          </Button>
        )}
      </Box>

      {medications.map((medication, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Medication {index + 1}</Typography>
            {medications.length > 1 && (
              <IconButton onClick={() => handleRemoveMedication(index)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <TextField
              required
              label="Medication Name"
              value={medication.name}
              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
              fullWidth
            />
            <TextField
              required
              label="Dosage"
              value={medication.dosage}
              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Route</InputLabel>
              <Select
                value={medication.route}
                label="Route"
                onChange={(e) => handleMedicationChange(index, 'route', e.target.value)}
              >
                {routeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              required
              label="Frequency"
              value={medication.frequency}
              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
              fullWidth
            />
            <TextField
              required
              label="Duration"
              value={medication.duration}
              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddMedication}
        sx={{ mb: 2 }}
      >
        Add Another Medication
      </Button>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Save Prescription
        </Button>
      </Box>

      <Dialog open={showPharmacyDialog} onClose={() => setShowPharmacyDialog(false)}>
        <DialogTitle>
          {pharmacy.name ? 'Update Pharmacy' : 'Add Pharmacy'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Pharmacy Name"
              value={pharmacy.name}
              onChange={(e) => setPharmacy({ ...pharmacy, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Address"
              value={pharmacy.address}
              onChange={(e) => setPharmacy({ ...pharmacy, address: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={pharmacy.phone}
              onChange={(e) => setPharmacy({ ...pharmacy, phone: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPharmacyDialog(false)}>Cancel</Button>
          <Button onClick={handlePharmacyUpdate} variant="contained" color="primary">
            Save Pharmacy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionForm;
