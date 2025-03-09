import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { createLocation } from '../../redux/slices/inventorySlice';

const LOCATIONS_PER_PAGE = 10;

const LOCATION_TYPES = ['WAREHOUSE', 'PHARMACY', 'STORAGE', 'OTHER'];

export default function LocationManagement() {
  const dispatch = useDispatch();
  const { locations } = useSelector((state) => state.inventory);
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facilityId: '', // This should be populated with the current facility ID
    type: 'STORAGE',
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        description: location.description,
        facilityId: location.facilityId,
        type: location.type,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        description: '',
        facilityId: '', // This should be populated with the current facility ID
        type: 'STORAGE',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (editingLocation) {
      // TODO: Implement update location
    } else {
      dispatch(createLocation(formData));
    }
    handleCloseDialog();
  };

  const validateForm = () => {
    return formData.name && formData.description && formData.type;
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Inventory Locations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Location
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations
              .slice(page * LOCATIONS_PER_PAGE, (page + 1) * LOCATIONS_PER_PAGE)
              .map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={location.type}
                      color={location.type === 'PHARMACY' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{location.description}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(location)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={locations.length}
          rowsPerPage={LOCATIONS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[LOCATIONS_PER_PAGE]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              name="name"
              label="Location Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              select
              name="type"
              label="Location Type"
              value={formData.type}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {LOCATION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!validateForm()}
          >
            {editingLocation ? 'Save Changes' : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 