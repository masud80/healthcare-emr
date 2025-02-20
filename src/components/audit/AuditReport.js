import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../redux/thunks/auditThunks';
import { TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tooltip } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AuditReport = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.audit);
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      if (!logs.length) return;
      
      // Get unique userIds from logs
      const uniqueUserIds = [...new Set(logs.map(log => log.userId))];
      
      // Fetch usernames for all unique userIds
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', 'in', uniqueUserIds));
      const querySnapshot = await getDocs(q);
      
      const newUsernames = {};
      querySnapshot.forEach(doc => {
        const userData = doc.data();
        newUsernames[userData.uid] = userData.name || userData.email;
      });
      
      setUsernames(newUsernames);
    };

    fetchUsernames();
  }, [logs]);

  const handleSearch = () => {
    dispatch(fetchAuditLogs({
      userId: userId || null,
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
            label="User Name"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
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
                <TableCell>User ID</TableCell>
                <TableCell>Username</TableCell>
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
                  <TableCell>
                    <Tooltip title={log.userId} placement="top">
                      <span>{usernames[log.userId] || 'Loading...'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.targetType}</TableCell>
                  <TableCell>
                    {log.details?.patientName && `Patient: ${log.details.patientName}`}
                    {log.details?.before && (
                      <div style={{ backgroundColor: '#fff3cd', padding: '4px 8px', marginBottom: '4px', borderRadius: '4px' }}>
                        <small>Before: {JSON.stringify(log.details.before)}</small>
                      </div>
                    )}
                    {log.details?.after && (
                      <div style={{ backgroundColor: '#d4edda', padding: '4px 8px', borderRadius: '4px' }}>
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
