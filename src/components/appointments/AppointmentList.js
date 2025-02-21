import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Paper, Box, Typography, CircularProgress } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/components.css';

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user } = useSelector((state) => state.auth);
  const { userFacilities } = useSelector((state) => state.facilities);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let appointmentsQuery = collection(db, 'appointments');
        let constraints = [];

        // Add date filter if selected
        if (selectedDate) {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          constraints.push(where('date', '>=', startOfDay));
          constraints.push(where('date', '<=', endOfDay));
        }

        // Add facility filter for non-admin users
        if (role !== 'admin' && role !== 'facilityAdmin' && userFacilities.length > 0) {
          const facilityIds = userFacilities.map(facility => facility.id);
          constraints.push(where('facilityId', 'in', facilityIds));
        }

        // Apply all constraints to query
        const finalQuery = constraints.length > 0 
          ? query(appointmentsQuery, ...constraints)
          : appointmentsQuery;

        const querySnapshot = await getDocs(finalQuery);
        console.log('Raw appointments:', querySnapshot.docs.map(doc => doc.data())); // Debug log
        const appointmentList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing appointment:', data); // Debug log
          // Ensure we have a valid Date object
          let dateObj;
          if (data.date instanceof Date) {
            dateObj = data.date;
          } else if (data.date?.toDate) {
            dateObj = data.date.toDate();
          } else if (data.date?._seconds) {
            // Handle Firestore Timestamp
            dateObj = new Date(data.date._seconds * 1000);
          } else {
            dateObj = new Date();
          }
          return {
            id: doc.id,
            ...data,
            date: `${dateObj.getMonth() + 1}`.padStart(2, '0') + '-' +
                  `${dateObj.getDate()}`.padStart(2, '0') + '-' +
                  dateObj.getFullYear() + ' ' +
                  `${dateObj.getHours() % 12 || 12}`.padStart(2, '0') + ':' +
                  `${dateObj.getMinutes()}`.padStart(2, '0') + ' ' +
                  (dateObj.getHours() >= 12 ? 'PM' : 'AM')
          };
        });
        console.log('Processed appointments:', appointmentList); // Debug log

        const filteredAppointments = statusFilter === 'all'
          ? appointmentList
          : appointmentList.filter(apt => apt.status === statusFilter);

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, statusFilter, userFacilities, role]);

  const columns = [
    { 
      field: 'date', 
      headerName: 'Date & Time', 
      flex: 1,
      minWidth: 180
    },
    { field: 'patientName', headerName: 'Patient', flex: 1, minWidth: 150 },
    { field: 'doctorName', headerName: 'Doctor', flex: 1, minWidth: 150 },
    { field: 'facilityName', headerName: 'Facility', flex: 1, minWidth: 150 },
    { field: 'purpose', headerName: 'Purpose', flex: 1, minWidth: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{
          backgroundColor: params.value === 'scheduled' ? '#4caf50' :
                         params.value === 'completed' ? '#2196f3' :
                         '#f44336',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {params.value}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate(`/appointments/${params.row.id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        {(role === 'admin' || role === 'doctor' || role === 'nurse') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/appointments/new')}
          >
            + New Appointment
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            placeholderText="Filter by Date"
            dateFormat="MM/dd/yyyy"
            className="input"
          />
          <select 
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <DataGrid
          rows={appointments}
          columns={columns}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f8f8',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AppointmentList;
