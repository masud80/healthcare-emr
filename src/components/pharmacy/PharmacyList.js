import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPharmacies } from '../../redux/slices/pharmacySlice';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog } from '@mui/material';
import CreatePharmacy from './CreatePharmacy';

const PharmacyList = () => {
  const dispatch = useDispatch();
  const pharmacies = useSelector(state => state.pharmacy.pharmacies);
  const status = useSelector(state => state.pharmacy.status);
  const [open, setOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPharmacies());
    }
  }, [status, dispatch]);

  const handleAddNew = () => {
    setSelectedPharmacy(null);
    setOpen(true);
  };

  const handleEdit = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPharmacy(null);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Pharmacy Management</h2>
        <Button variant="contained" color="primary" onClick={handleAddNew}>
          Add New Pharmacy
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Fax</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pharmacies.map((pharmacy) => (
              <TableRow key={pharmacy.id}>
                <TableCell>{pharmacy.name}</TableCell>
                <TableCell>{pharmacy.address}</TableCell>
                <TableCell>{pharmacy.phone}</TableCell>
                <TableCell>{pharmacy.fax}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(pharmacy)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <CreatePharmacy
          onClose={handleClose}
          pharmacy={selectedPharmacy}
        />
      </Dialog>
    </div>
  );
};

export default PharmacyList;
