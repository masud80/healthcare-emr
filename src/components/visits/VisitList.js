import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientVisits } from '../../redux/slices/visitsSlice';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import format from 'date-fns/format';

const VisitList = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { visits, loading, error } = useSelector(state => state.visits);
  const { user } = useSelector(state => state.auth);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (user) {
      dispatch(fetchPatientVisits(patientId));
    }
  }, [dispatch, patientId, user]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredVisits = visits.filter(visit => {
    const searchString = searchTerm.toLowerCase();
    return (
      visit.notes.consultationNotes?.toLowerCase().includes(searchString) ||
      visit.symptoms?.some(symptom => symptom.toLowerCase().includes(searchString)) ||
      visit.notes.soapNotes?.assessment?.toLowerCase().includes(searchString) ||
      visit.actionPlan?.toLowerCase().includes(searchString)
    );
  });

  const paginatedVisits = filteredVisits.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderVitalsChips = (vitals) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        size="small"
        label={`BP: ${vitals.bloodPressure}`}
        color="primary"
        variant="outlined"
      />
      <Chip
        size="small"
        label={`HR: ${vitals.heartRate}`}
        color="primary"
        variant="outlined"
      />
      <Chip
        size="small"
        label={`Temp: ${vitals.temperature}°F`}
        color="primary"
        variant="outlined"
      />
    </Box>
  );

  if (!user) {
    return <Typography>Please log in to view visits.</Typography>;
  }

  if (loading) {
    return <Typography>Loading visits...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading visits: {error}</Typography>;
  }

  if (!visits || visits.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Patient Visits</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/patients/${patientId}/visits/new`)}
          >
            New Visit
          </Button>
        </Box>
        <Typography>No visits found for this patient.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Patient Visits</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/patients/${patientId}/visits/new`)}
        >
          New Visit
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search visits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Vitals</TableCell>
                <TableCell>Symptoms</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Action Plan</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    {format(new Date(visit.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{renderVitalsChips(visit.vitals)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {visit.symptoms.map((symptom, index) => (
                        <Chip
                          key={index}
                          label={symptom}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {visit.notes.consultationNotes?.substring(0, 100)}...
                  </TableCell>
                  <TableCell>
                    {visit.actionPlan?.substring(0, 100)}...
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => navigate(`/patients/${patientId}/visits/${visit.id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredVisits.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default VisitList;
