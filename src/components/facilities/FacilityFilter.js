import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSelectedFacilities,
  selectUserFacilities,
  selectSelectedFacilities,
  selectLoading,
  selectError,
  selectPagination
} from '../../redux/slices/facilitiesSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';
import { 
  Box, 
  Typography, 
  Pagination, 
  CircularProgress, 
  TextField, 
  InputAdornment,
  Chip,
  Badge,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BusinessIcon from '@mui/icons-material/Business';

const FacilityFilter = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const dropdownRef = useRef(null);
  
  const userFacilities = useSelector(selectUserFacilities);
  const selectedFacilities = useSelector(selectSelectedFacilities);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const user = useSelector(selectUser);
  const pagination = useSelector(selectPagination);

  useEffect(() => {
    if (user?.uid && !hasInitialFetch) {
      console.log('Initial facilities fetch for user:', user.uid);
      dispatch(fetchUserFacilities({ page: currentPage, limit: 10 }));
      setHasInitialFetch(true);
    }
  }, [dispatch, user, currentPage, hasInitialFetch]);

  useEffect(() => {
    if (selectedFacilities.length === 0 && userFacilities.length > 0) {
      console.log('Setting initial selected facilities');
      const facilityIds = userFacilities.map(f => f.id);
      dispatch(setSelectedFacilities(facilityIds));
    }
  }, [userFacilities, selectedFacilities.length, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFacilityToggle = (facilityId) => {
    const updatedSelection = selectedFacilities.includes(facilityId)
      ? selectedFacilities.filter(id => id !== facilityId)
      : [...selectedFacilities, facilityId];
    dispatch(setSelectedFacilities(updatedSelection));
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    if (value !== currentPage) {
      console.log('Fetching facilities for page:', value);
      dispatch(fetchUserFacilities({ page: value, limit: 10 }));
    }
  };

  const filteredFacilities = userFacilities.filter(facility => 
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFacilityTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hospital':
        return <LocalHospitalIcon fontSize="small" />;
      case 'clinic':
      case 'laboratory':
      case 'pharmacy':
      case 'rehabilitation center':
        return <BusinessIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getFacilityTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'hospital':
        return '#2196f3';
      case 'clinic':
        return '#4caf50';
      case 'laboratory':
        return '#ff9800';
      case 'pharmacy':
        return '#9c27b0';
      case 'rehabilitation center':
        return '#795548';
      default:
        return '#757575';
    }
  };

  return (
    <div className="facility-filter" ref={dropdownRef}>
      <button
        className="facility-filter-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <Badge badgeContent={selectedFacilities.length} color="primary">
          <BusinessIcon sx={{ mr: 1 }} />
          <span>Facilities</span>
        </Badge>
        {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </button>
      
      {error && (
        <div className="facility-error">
          Error loading facilities. Please try again.
        </div>
      )}
      
      {isOpen && (
        <div className="facility-dropdown">
          <div className="facility-dropdown-header">
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Available Facilities
            </Typography>
            <TextField
              className="facility-search"
              size="small"
              placeholder="Search facilities..."
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
          </div>
          
          <Divider />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <div className="facility-empty facility-error">
              Failed to load facilities. Please refresh the page.
            </div>
          ) : filteredFacilities.length > 0 ? (
            <>
              <div className="facility-list">
                {filteredFacilities.map((facility) => (
                  <label key={facility.id} className="facility-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(facility.id)}
                      onChange={() => handleFacilityToggle(facility.id)}
                    />
                    <div className="facility-info">
                      <span className="facility-name">{facility.name}</span>
                      {facility.type && (
                        <Chip
                          icon={getFacilityTypeIcon(facility.type)}
                          label={facility.type}
                          size="small"
                          sx={{
                            backgroundColor: `${getFacilityTypeColor(facility.type)}15`,
                            color: getFacilityTypeColor(facility.type),
                            '.MuiChip-icon': {
                              color: getFacilityTypeColor(facility.type),
                            },
                          }}
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {user?.role === 'admin' && pagination.totalPages > 1 && (
                <div className="facility-footer">
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Showing {filteredFacilities.length} of {pagination.totalCount} facilities
                  </Typography>
                </div>
              )}
            </>
          ) : (
            <div className="facility-empty">
              No facilities found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilityFilter;
