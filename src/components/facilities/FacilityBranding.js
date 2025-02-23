import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { selectUser } from '../../redux/slices/authSlice';

const FacilityBranding = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [brandingData, setBrandingData] = useState({
    ribbonColor: '#1976d2',
    facilityName: '',
    logo: null,
    logoUrl: ''
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilitiesRef = collection(db, 'facilities');
        const q = query(
          facilitiesRef,
          where('adminIds', 'array-contains', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const facilitiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFacilities();
    }
  }, [user]);

  const handleFacilitySelect = (facilityId) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facilityId)) {
        return prev.filter(id => id !== facilityId);
      }
      return [...prev, facilityId];
    });
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBrandingData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = brandingData.logoUrl;

      if (brandingData.logo) {
        const storageRef = ref(storage, `facility-logos/${Date.now()}-${brandingData.logo.name}`);
        const uploadResult = await uploadBytes(storageRef, brandingData.logo);
        logoUrl = await getDownloadURL(uploadResult.ref);
      }

      for (const facilityId of selectedFacilities) {
        const facilityRef = doc(db, 'facilities', facilityId);
        await updateDoc(facilityRef, {
          branding: {
            ribbonColor: brandingData.ribbonColor,
            facilityName: brandingData.facilityName,
            logoUrl
          }
        });
      }

      navigate('/facilities');
    } catch (error) {
      console.error('Error updating branding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Facility Branding
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Facilities to Brand
              </Typography>
              {facilities.map(facility => (
                <FormControlLabel
                  key={facility.id}
                  control={
                    <Checkbox
                      checked={selectedFacilities.includes(facility.id)}
                      onChange={() => handleFacilitySelect(facility.id)}
                    />
                  }
                  label={facility.name}
                />
              ))}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facility Name Display"
                value={brandingData.facilityName}
                onChange={(e) => setBrandingData(prev => ({
                  ...prev,
                  facilityName: e.target.value
                }))}
                helperText="This will appear under 'Healthcare EMR'"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ribbon Color"
                type="color"
                value={brandingData.ribbonColor}
                onChange={(e) => setBrandingData(prev => ({
                  ...prev,
                  ribbonColor: e.target.value
                }))}
                helperText="Choose the color for the top ribbon"
              />
            </Grid>

            <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                id="logo-upload"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span">
                  Upload Logo
                </Button>
              </label>
              {brandingData.logo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {brandingData.logo.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/facilities')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={selectedFacilities.length === 0 || loading}
                >
                  Apply Branding
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FacilityBranding;
