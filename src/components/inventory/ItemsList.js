import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { createItem, updateItem } from '../../redux/slices/inventorySlice';

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  'MEDICATION',
  'SURGICAL_TOOL',
  'PPE',
  'CONSUMABLE',
  'EQUIPMENT',
  'OTHER',
];

const MEDICAL_CODE_TYPES = ['SNOMED', 'LOINC', 'OTHER'];

export default function ItemsList({ items = [] }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'MEDICATION',
    unit: '',
    minStockLevel: 0,
    reorderPoint: 0,
    medicalCodes: [],
  });
  const [newMedicalCode, setNewMedicalCode] = useState({
    code: '',
    type: 'SNOMED',
    description: '',
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        minStockLevel: item.minStockLevel,
        reorderPoint: item.reorderPoint,
        medicalCodes: [...item.medicalCodes],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'MEDICATION',
        unit: '',
        minStockLevel: 0,
        reorderPoint: 0,
        medicalCodes: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'MEDICATION',
      unit: '',
      minStockLevel: 0,
      reorderPoint: 0,
      medicalCodes: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minStockLevel' || name === 'reorderPoint' ? Number(value) : value,
    }));
  };

  const handleAddMedicalCode = () => {
    if (newMedicalCode.code && newMedicalCode.type && newMedicalCode.description) {
      setFormData(prev => ({
        ...prev,
        medicalCodes: [...prev.medicalCodes, { ...newMedicalCode }],
      }));
      setNewMedicalCode({
        code: '',
        type: 'SNOMED',
        description: '',
      });
    }
  };

  const handleRemoveMedicalCode = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalCodes: prev.medicalCodes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (editingItem) {
      dispatch(updateItem({ id: editingItem.id, item: formData }));
    } else {
      dispatch(createItem(formData));
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Min Stock Level</TableCell>
              <TableCell>Reorder Point</TableCell>
              <TableCell>Medical Codes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(items) && items
              .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.minStockLevel}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>
                    {Array.isArray(item.medicalCodes) && item.medicalCodes.map((code, index) => (
                      <Chip
                        key={index}
                        label={`${code.type}: ${code.code}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(item)}
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
          count={Array.isArray(items) ? items.length : 0}
          rowsPerPage={ITEMS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[ITEMS_PER_PAGE]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleInputChange}
              select
              fullWidth
              required
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="unit"
              label="Unit"
              value={formData.unit}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="minStockLevel"
              label="Minimum Stock Level"
              type="number"
              value={formData.minStockLevel}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="reorderPoint"
              label="Reorder Point"
              type="number"
              value={formData.reorderPoint}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  name="code"
                  label="Medical Code"
                  value={newMedicalCode.code}
                  onChange={(e) => setNewMedicalCode(prev => ({ ...prev, code: e.target.value }))}
                  sx={{ mr: 1 }}
                />
                <TextField
                  name="type"
                  label="Code Type"
                  value={newMedicalCode.type}
                  onChange={(e) => setNewMedicalCode(prev => ({ ...prev, type: e.target.value }))}
                  select
                  sx={{ mr: 1 }}
                >
                  {MEDICAL_CODE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="description"
                  label="Code Description"
                  value={newMedicalCode.description}
                  onChange={(e) => setNewMedicalCode(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddMedicalCode}
                  disabled={!newMedicalCode.code || !newMedicalCode.type || !newMedicalCode.description}
                >
                  Add Code
                </Button>
              </Box>
              <Box>
                {formData.medicalCodes.map((code, index) => (
                  <Chip
                    key={index}
                    label={`${code.type}: ${code.code}`}
                    onDelete={() => handleRemoveMedicalCode(index)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.category || !formData.unit}
          >
            {editingItem ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 