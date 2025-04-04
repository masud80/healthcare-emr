import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase/config';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Paper, TextField, Box, Typography, CircularProgress, Checkbox } from '@mui/material';
import PatientHoverModal from './PatientHoverModal';
import '../../styles/components.css';

const PatientList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const { userFacilities } = useSelector((state) => state.facilities);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredPatient, setHoveredPatient] = useState({ data: null, anchorEl: null });

  useEffect(() => {
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        let patientsQuery;
        
        if (role === 'admin') {
          console.log('Admin user - fetching all patients');
          patientsQuery = query(
            collection(db, 'patients'),
            orderBy('name', 'asc')
          );
        } else {
          if (!userFacilities || userFacilities.length === 0) {
            console.log('No facilities assigned');
            setPatients([]);
            return;
          }

          const facilityIds = userFacilities.map(f => f.id);
          console.log('Fetching patients for facilities:', facilityIds);
          
          patientsQuery = query(
            collection(db, 'patients'),
            where('facilityId', 'in', facilityIds),
            orderBy('name', 'asc')
          );
        }

        const querySnapshot = await getDocs(patientsQuery);
        
        if (querySnapshot.empty) {
          console.log('No patients found in assigned facilities');
          setPatients([]);
          return;
        }

        const patientList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A',
            contact: data.contact || 'N/A',
            email: data.email || 'N/A',
            bloodType: data.bloodType || 'N/A',
            facilityId: data.facilityId || '',
            isPatientPortalEnabled: data.isPatientPortalEnabled || false
          };
        });

        console.log('Fetched patients:', patientList);
        setPatients(patientList);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError(error.message || 'Error fetching patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [userFacilities, role]);

  const handlePatientPortalToggle = async (patientId, newValue) => {
    try {
      // Only send email when enabling the portal
      if (newValue) {
        const patient = patients.find(p => p.id === patientId);
        if (!patient?.email) {
          throw new Error('Patient email is required for portal access');
        }

        // Call Firebase Function to send registration email
        const functions = getFunctions();
        const sendPatientRegistrationEmail = httpsCallable(functions, 'sendPatientRegistrationEmail');
        
        await sendPatientRegistrationEmail({
          patientId,
          email: patient.email,
          name: patient.name
        });
      }

      // Update Firestore
      await updateDoc(doc(db, 'patients', patientId), {
        isPatientPortalEnabled: newValue
      });
      
      // Update local state
      setPatients(patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, isPatientPortalEnabled: newValue }
          : patient
      ));

    } catch (error) {
      console.error('Error updating patient portal access:', error);
      // You might want to add a proper error notification here
    }
  };

  const handleMouseEnter = (event, patient) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get element position
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Modal dimensions (from PatientHoverModal styles)
    const modalWidth = 300; // width defined in HoverModal styled component
    const modalHeight = 400; // approximate height, adjust if needed
    
    // Calculate position
    let left = rect.right + 10; // Default position (10px to the right of element)
    let top = rect.top;
    
    // Check right boundary
    if (left + modalWidth > viewportWidth) {
      left = rect.left - modalWidth - 10; // Place to the left of element
    }
    
    // Check bottom boundary
    if (top + modalHeight > viewportHeight) {
      top = viewportHeight - modalHeight - 10; // 10px padding from bottom
    }
    
    // Check top boundary
    if (top < 0) {
      top = 10; // 10px padding from top
    }
    
    setHoveredPatient({
      data: {
        name: patient.name,
        profileImage: patient.profileImage,
        facilityName: patient.facilityName || 'Unknown Facility',
        bloodType: patient.bloodType,
        bmi: patient.bmi || 0,
        medicalActivity: [
          { facilityName: patient.facilityName || 'Unknown Facility', date: new Date().toISOString() }
        ]
      },
      anchorEl: event.currentTarget,
      position: { left, top }
    });
  };

  const handleMouseLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setHoveredPatient({ data: null, anchorEl: null });
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div
          onMouseEnter={(e) => handleMouseEnter(e, params.row)}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: 'dateOfBirth', headerName: 'Date of Birth', flex: 1, minWidth: 120 },
    { field: 'contact', headerName: 'Contact', flex: 1, minWidth: 120 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'bloodType', headerName: 'Blood Type', flex: 0.5, minWidth: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate(`/patients/${params.row.id}`)}
        >
          View Details
        </Button>
      ),
    },
    {
      field: 'isPatientPortalEnabled',
      headerName: 'Enable Patient Portal',
      width: 160,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isPatientPortalEnabled || false}
          onChange={(event) => handlePatientPortalToggle(params.row.id, event.target.checked)}
          disabled={role !== 'admin'} // Only admin can toggle this
        />
      ),
    },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" gutterBottom>
          Error: {error}
        </Typography>
        <Button 
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Patients
        </Typography>
        {(role === 'admin' || role === 'doctor') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/patients/new')}
          >
            + Add Patient
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {(role !== 'admin' && userFacilities.length === 0) ? (
          <Typography align="center">
            No facilities assigned. Please contact an administrator.
          </Typography>
        ) : filteredPatients.length === 0 ? (
          <Box textAlign="center">
            <Typography gutterBottom>
              {role === 'admin' ? 'No patients found in the system' : 'No patients found in your assigned facilities'}
            </Typography>
            {searchTerm && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <>
            <DataGrid
              rows={filteredPatients}
              columns={columns}
              autoHeight
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
            />
            {hoveredPatient.data && hoveredPatient.anchorEl && (
              <Box
                sx={{
                  position: 'fixed',
                  left: `${hoveredPatient.position?.left}px`,
                  top: `${hoveredPatient.position?.top}px`,
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <PatientHoverModal
                  patient={hoveredPatient.data}
                  onEditProfile={() => navigate(`/patients/${hoveredPatient.data.id}/edit`)}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PatientList;
