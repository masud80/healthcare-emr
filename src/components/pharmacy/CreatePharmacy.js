import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addPharmacy, 
  updatePharmacy, 
  searchPharmaciesOnline,
  clearSearchResults 
} from '../../redux/slices/pharmacySlice';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { 
  initializeMap, 
  initializeAutocomplete 
} from '../../utils/googlePlaces';

const CreatePharmacy = ({ onClose, pharmacy }) => {
  const dispatch = useDispatch();
  const { searchResults, searchStatus } = useSelector(state => state.pharmacy);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    licenseNumber: '',
    location: null
  });

  const mapRef = useRef(null);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const handleSearchResultClick = useCallback((result) => {
    setFormData(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      phone: result.phone || prev.phone
    }));
    
    // Center map on selected location
    if (result.location && mapInstanceRef.current) {
      const { map } = mapInstanceRef.current;
      map.setCenter(result.location);
      map.setZoom(15);
    }

    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        address: pharmacy.address || '',
        phone: pharmacy.phone || '',
        fax: pharmacy.fax || '',
        email: pharmacy.email || '',
        licenseNumber: pharmacy.licenseNumber || ''
      });
    }
  }, [pharmacy]);

  const setupAutocomplete = useCallback(async () => {
    if (addressInputRef.current && !autocompleteRef.current) {
      try {
        const autocomplete = await initializeAutocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setFormData(prev => ({
              ...prev,
              address: place.formatted_address,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            }));

            // Update map if initialized
            if (mapInstanceRef.current) {
              const { map } = mapInstanceRef.current;
              map.setCenter(place.geometry.location);
              map.setZoom(15);
            }
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }
  }, []);

  const initMap = useCallback(async () => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        const { map, AdvancedMarkerElement, googleMaps } = await initializeMap(mapRef.current);
        mapInstanceRef.current = {
          map,
          AdvancedMarkerElement,
          googleMaps
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, []);

  useEffect(() => {
    initMap();
    setupAutocomplete();
  }, [initMap, setupAutocomplete]);

  useEffect(() => {
    if (searchResults.length > 0 && mapInstanceRef.current) {
      const { map, AdvancedMarkerElement } = mapInstanceRef.current;
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];

      // Create bounds object to fit all markers
      const bounds = new mapInstanceRef.current.googleMaps.LatLngBounds();

      // Add new markers
      searchResults.forEach(place => {
        if (place.location) {
          const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.name
          });

          marker.addListener('click', () => {
            handleSearchResultClick(place);
          });

          markersRef.current.push(marker);
          bounds.extend(place.location);
        }
      });

      // Fit map to bounds
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        if (searchResults.length === 1) {
          map.setZoom(15);
        }
      }
    }
  }, [searchResults, handleSearchResultClick]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check for search trigger
    if (name === 'name' && value.length >= 3) {
      dispatch(searchPharmaciesOnline(value));
    } else if (name === 'name' && value.length < 3) {
      dispatch(clearSearchResults());
    }

    // Don't update address directly when using autocomplete
    if (name === 'address' && autocompleteRef.current) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (pharmacy) {
        await dispatch(updatePharmacy({ id: pharmacy.id, data: formData })).unwrap();
      } else {
        await dispatch(addPharmacy(formData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save pharmacy:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {pharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} style={{ marginTop: '8px' }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Pharmacy Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                endAdornment: searchStatus === 'loading' && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }}
              helperText="Start typing to search for pharmacies"
            />
          </Grid>

          <Grid item xs={12}>
            {/* Map Container */}
            <Paper 
              elevation={3} 
              sx={{ 
                display: searchResults.length > 0 ? 'block' : 'none',
                height: '300px',
                width: '100%',
                marginBottom: 2
              }}
            >
              <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />
            </Paper>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <List sx={{ 
                maxHeight: 200, 
                overflow: 'auto', 
                bgcolor: 'background.paper',
                marginBottom: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}>
                {searchResults.map((result, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    onClick={() => handleSearchResultClick(result)}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {result.name}
                          {result.businessStatus && (
                            <Typography 
                              component="span" 
                              sx={{ 
                                ml: 1,
                                color: result.businessStatus === 'Currently operating' ? 'success.main' : 'error.main'
                              }}
                            >
                              • {result.businessStatus}
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{result.address}</Typography>
                          {result.phone && (
                            <Typography variant="body2">📞 {result.phone}</Typography>
                          )}
                          {result.rating && (
                            <Typography variant="body2">⭐ {result.rating} / 5</Typography>
                          )}
                          {result.openingHours && (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              📅 Hours: {result.openingHours[0]}...
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              inputRef={addressInputRef}
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              helperText="Start typing to autocomplete address"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="fax"
              label="Fax Number"
              value={formData.fax}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="licenseNumber"
              label="License Number"
              value={formData.licenseNumber}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {pharmacy ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default CreatePharmacy;
