import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const BillList = ({ bills }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Sort function
  const sortFunction = (a, b) => {
    if (orderBy === 'totalAmount' || orderBy === 'paidAmount') {
      return order === 'asc' 
        ? parseFloat(a[orderBy]) - parseFloat(b[orderBy])
        : parseFloat(b[orderBy]) - parseFloat(a[orderBy]);
    }
    
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  };

  const sortedBills = [...bills].sort(sortFunction);
  const paginatedBills = sortedBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'billNumber'}
                  direction={orderBy === 'billNumber' ? order : 'asc'}
                  onClick={() => handleSort('billNumber')}
                >
                  Bill #
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'patientName'}
                  direction={orderBy === 'patientName' ? order : 'asc'}
                  onClick={() => handleSort('patientName')}
                >
                  Patient
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'totalAmount'}
                  direction={orderBy === 'totalAmount' ? order : 'asc'}
                  onClick={() => handleSort('totalAmount')}
                >
                  Total Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'paidAmount'}
                  direction={orderBy === 'paidAmount' ? order : 'asc'}
                  onClick={() => handleSort('paidAmount')}
                >
                  Paid Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBills.map((bill) => (
              <TableRow key={bill.id} hover>
                <TableCell>{bill.billNumber}</TableCell>
                <TableCell>{bill.patientName}</TableCell>
                <TableCell>
                  {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                <TableCell>{formatCurrency(bill.paidAmount || 0)}</TableCell>
                <TableCell>
                  <Chip
                    label={bill.status}
                    color={getStatusColor(bill.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/billing/${bill.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {bill.status !== 'paid' && (
                    <Tooltip title="Process Payment">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/billing/${bill.id}/payment`)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={bills.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default BillList;
