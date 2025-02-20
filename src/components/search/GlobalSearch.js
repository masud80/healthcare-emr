import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Popper, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { selectUser, selectRole } from '../../redux/slices/authSlice';

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

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
      let baseQuery = collection(db, 'patients');
      let constraints = [
        orderBy('lastName'),
        limit(10)
      ];

      // Add facility filter for non-admin users
      if (role !== 'admin' && user.facilities) {
        constraints.push(where('facilityIds', 'array-contains-any', user.facilities));
      }

      // Create query with search term
      const termLower = term.toLowerCase();
      const termUpper = term.charAt(0).toUpperCase() + term.slice(1);
      
      const queries = [
        query(baseQuery, ...constraints, where('lastName', '>=', termLower), where('lastName', '<=', termLower + '\uf8ff')),
        query(baseQuery, ...constraints, where('firstName', '>=', termLower), where('firstName', '<=', termLower + '\uf8ff')),
        query(baseQuery, ...constraints, where('lastName', '>=', termUpper), where('lastName', '<=', termUpper + '\uf8ff')),
        query(baseQuery, ...constraints, where('firstName', '>=', termUpper), where('firstName', '<=', termUpper + '\uf8ff'))
      ];

      const results = await Promise.all(queries.map(q => getDocs(q)));
      
      // Combine and deduplicate results
      const combinedResults = results.flatMap(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      // Remove duplicates based on patient ID
      const uniqueResults = Array.from(
        new Map(combinedResults.map(item => [item.id, item])).values()
      );

      setSearchResults(uniqueResults);
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
    <Box sx={{ position: 'relative', width: '400px', mx: 'auto' }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        variant="outlined"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} color="inherit" />
            </InputAdornment>
          ),
        }}
      />
      <Popper
        open={searchResults.length > 0}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: '400px', zIndex: 1300 }}
      >
        <Paper elevation={3}>
          <List>
            {searchResults.map((patient) => (
              <ListItem 
                key={patient.id} 
                button 
                onClick={() => handlePatientClick(patient.id)}
              >
                <ListItemText 
                  primary={`${patient.firstName} ${patient.lastName}`}
                  secondary={`DOB: ${patient.dateOfBirth || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>
    </Box>
  );
};

export default GlobalSearch;
