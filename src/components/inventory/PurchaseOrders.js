import React, { useEffect, useState } from 'react';
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
import { fetchPurchaseOrders, fetchSuppliers, fetchItems } from '../../redux/slices/inventorySlice';

const ORDERS_PER_PAGE = 10;

const ORDER_STATUS = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export default function PurchaseOrders() {
  const dispatch = useDispatch();
  const { purchaseOrders = [], suppliers = [], items = [], loading, error } = useSelector((state) => state.inventory);
  const [page, setPage] = useState(0);

  useEffect(() => {
    console.log('Loading purchase orders data...');
    dispatch(fetchPurchaseOrders());
    dispatch(fetchSuppliers());
    dispatch(fetchItems());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading purchase orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Purchase Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Implement create order */}}
        >
          Create Order
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(purchaseOrders) && purchaseOrders
              .slice(page * ORDERS_PER_PAGE, (page + 1) * ORDERS_PER_PAGE)
              .map((order) => {
                const supplier = suppliers.find(s => s.id === order.supplierId);
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown Supplier'}</TableCell>
                    <TableCell>
                      {Array.isArray(order.items) && order.items.map((item, index) => {
                        const itemData = items.find(i => i.id === item.itemId);
                        return (
                          <Chip
                            key={index}
                            label={`${itemData?.name || 'Unknown'} (${item.quantity})`}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        );
                      })}
                    </TableCell>
                    <TableCell>${order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'APPROVED' ? 'success' :
                          order.status === 'REJECTED' ? 'error' :
                          order.status === 'PENDING' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {/* TODO: Implement edit order */}}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={Array.isArray(purchaseOrders) ? purchaseOrders.length : 0}
          rowsPerPage={ORDERS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[ORDERS_PER_PAGE]}
        />
      </TableContainer>
    </Box>
  );
} 