import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../redux/thunks/auditThunks';
import { TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AuditReport = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.audit);
  const [patientName, setPatientName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSearch = () => {
    dispatch(fetchAuditLogs({
      patientName: patientName || null,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null
    }));
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Audit Report</h2>
      
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <TextField
            label="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </div>
      </Paper>

      {error && (
        <Paper style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#ffebee' }}>
          Error: {error}
        </Paper>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target Type</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.targetType}</TableCell>
                  <TableCell>
                    {log.details?.patientName && `Patient: ${log.details.patientName}`}
                    {log.details?.before && (
                      <div>
                        <small>Before: {JSON.stringify(log.details.before)}</small>
                      </div>
                    )}
                    {log.details?.after && (
                      <div>
                        <small>After: {JSON.stringify(log.details.after)}</small>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default AuditReport;
