import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';
import { 
  TextField, 
  Popper, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { selectUser, selectRole } from '../../redux/slices/authSlice';

const modernStyles = {
  searchField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(0, 255, 208, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      color: '#fff',
      '& fieldset': {
        borderColor: 'rgba(0, 255, 208, 0.2)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 255, 208, 0.3)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00FFD0',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'rgba(0, 255, 208, 0.7)',
      opacity: 1,
    },
  },
  searchIcon: {
    color: '#00FFD0',
  },
  loader: {
    color: '#00FFD0',
  },
  resultsContainer: {
    background: 'linear-gradient(135deg, rgba(16, 20, 24, 0.95) 0%, rgba(0, 48, 46, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 255, 208, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 255, 208, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  resultItem: {
    '&:hover': {
      backgroundColor: 'rgba(0, 255, 208, 0.1)',
    },
    '& .MuiTypography-root': {
      color: '#fff',
    },
    '& .MuiTypography-secondary': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  closeButton: {
    color: '#00FFD0',
    '&:hover': {
      backgroundColor: 'rgba(0, 255, 208, 0.1)',
    },
  },
};

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const { userFacilities } = useSelector((state) => state.facilities);

  useEffect(() => {
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    if (inputRef.current) {
      setAnchorEl(inputRef.current);
    }
  }, []);

  const searchPatients = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Get patients based on user's facilities
      let baseQuery = collection(db, 'patients');
      let patientsQuery;
      if (role === 'admin') {
        patientsQuery = query(baseQuery, limit(100));
      } else if (userFacilities?.length > 0) {
        const facilityIds = userFacilities.map(f => f.id);
        patientsQuery = query(
          baseQuery,
          where('facilityId', 'in', facilityIds),
          limit(100)
        );
      } else {
        setSearchResults([]);
        return;
      }

      // Get medical records
      const medicalRecordsRef = collection(db, 'medical_records');
      const medicalRecordsQuery = query(medicalRecordsRef, limit(100));

      // Execute both queries in parallel
      const [patientsSnapshot, medicalRecordsSnapshot] = await Promise.all([
        getDocs(patientsQuery),
        getDocs(medicalRecordsQuery)
      ]);

      // Create a map of medical records by patient ID
      const medicalRecordsByPatient = {};
      medicalRecordsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!medicalRecordsByPatient[data.patientId]) {
          medicalRecordsByPatient[data.patientId] = [];
        }
        medicalRecordsByPatient[data.patientId].push({
          id: doc.id,
          ...data
        });
      });
      
      // Client-side filtering
      const searchTermLower = term.toLowerCase();
      const filteredResults = patientsSnapshot.docs
        .map(doc => {
          const patientData = doc.data();
          const patientId = doc.id;
          const medicalRecords = medicalRecordsByPatient[patientId] || [];
          
          // Check if any medical records match the search term
          const matchingRecords = medicalRecords.filter(record => 
            record.description?.toLowerCase().includes(searchTermLower) ||
            record.diagnosis?.toLowerCase().includes(searchTermLower) ||
            record.treatment?.toLowerCase().includes(searchTermLower) ||
            record.type?.toLowerCase().includes(searchTermLower)
          );

          return {
            id: patientId,
            name: patientData.name || 'Unknown',
            dateOfBirth: patientData.dateOfBirth || null,
            contact: patientData.contact || '',
            email: patientData.email || '',
            bloodType: patientData.bloodType || '',
            facilityId: patientData.facilityId || '',
            matchingRecords: matchingRecords.slice(0, 3) // Include up to 3 matching records
          };
        })
        .filter(patient => {
          // Format date of birth for searching if it exists
          const dobFormatted = patient.dateOfBirth ? 
            new Date(patient.dateOfBirth).toLocaleDateString() : '';
          
          return patient.name.toLowerCase().includes(searchTermLower) ||
            patient.email.toLowerCase().includes(searchTermLower) ||
            (patient.contact && patient.contact.includes(searchTermLower)) ||
            (dobFormatted && dobFormatted.includes(searchTermLower)) ||
            patient.matchingRecords.length > 0; // Include if medical records match
        })
        .slice(0, 10); // Limit to top 10 results

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Box sx={{ position: 'relative', width: '500px', mx: 'auto' }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        variant="outlined"
        placeholder="Search patients by name, DOB (MM/DD/YYYY), medical history..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={modernStyles.searchField}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={modernStyles.searchIcon} />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} sx={modernStyles.loader} />
            </InputAdornment>
          ),
        }}
      />
      
      <Popper
        open={searchResults.length > 0}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: '500px', zIndex: 1300 }}
      >
        <Paper elevation={3} sx={modernStyles.resultsContainer}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              onClick={() => setSearchResults([])}
              sx={modernStyles.closeButton}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <List sx={{ pt: 1, pb: 1 }}>
              {searchResults.map((patient) => (
                <ListItem 
                  key={patient.id} 
                  button 
                  onClick={() => handlePatientClick(patient.id)}
                  sx={{ ...modernStyles.resultItem, flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <>
                        <div>DOB: {patient.dateOfBirth || 'N/A'}</div>
                        {patient.matchingRecords.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <strong style={{ color: '#00FFD0' }}>Matching Records:</strong>
                            {patient.matchingRecords.map((record, index) => (
                              <div key={record.id} style={{ marginLeft: '8px', fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.7)' }}>
                                <div>{new Date(record.date).toLocaleDateString()} - {record.type}</div>
                                {record.diagnosis && <div>Diagnosis: {record.diagnosis}</div>}
                                {record.treatment && <div>Treatment: {record.treatment}</div>}
                                {record.description && <div>Notes: {record.description}</div>}
                                {index < patient.matchingRecords.length - 1 && (
                                  <div style={{ margin: '4px 0', borderBottom: '1px solid rgba(0, 255, 208, 0.1)' }} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Popper>
    </Box>
  );
};

export default GlobalSearch;
