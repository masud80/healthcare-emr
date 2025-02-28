import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPharmacies } from '../../redux/slices/pharmacySlice';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const PharmacyList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pharmacies = useSelector(state => state.pharmacy.pharmacies);
  const status = useSelector(state => state.pharmacy.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPharmacies());
    }
  }, [status, dispatch]);

  const handleAddNew = () => {
    navigate('/admin/pharmacies/create');
  };

  const handleEdit = (pharmacy) => {
    navigate(`/admin/pharmacies/${pharmacy.id}/edit`);
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
    </div>
  );
};

export default PharmacyList;
