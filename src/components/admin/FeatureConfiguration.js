import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Typography,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FeatureConfiguration = () => {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    fetchFeatureAndFacilities();
  }, [featureId]);

  const fetchFeatureAndFacilities = async () => {
    try {
      // Fetch feature details
      const featureDoc = await getDoc(doc(db, 'features', featureId));
      if (!featureDoc.exists()) {
        console.error('Feature not found');
        return;
      }
      setFeature({ id: featureDoc.id, ...featureDoc.data() });

      // Fetch facility groups
      const groupsSnapshot = await getDocs(collection(db, 'facilityGroups'));
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);

      // Fetch all facilities
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      const facilitiesData = facilitiesSnapshot.docs.map(doc => {
        const facility = {
          id: doc.id,
          ...doc.data()
        };
        // Find the group this facility belongs to
        const group = groupsData.find(g => 
          Array.isArray(g.facilities) && 
          g.facilities.includes(doc.id)
        );
        facility.groupName = group?.name || '';
        return facility;
      });
      setFacilities(facilitiesData);

      // Fetch existing feature configurations
      const configSnapshot = await getDocs(collection(db, 'feature_configuration'));
      const existingConfigs = configSnapshot.docs
        .filter(doc => doc.data().featureId === featureId)
        .map(doc => doc.data().facilityId);
      
      setSelectedFacilities(existingConfigs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedFacilities = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy] || '';
      let bValue = b[orderBy] || '';
      
      // Handle special cases for groupName
      if (orderBy === 'groupName') {
        aValue = a.groupName || 'Unassigned';
        bValue = b.groupName || 'Unassigned';
      }

      if (order === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    };

    return [...facilities].sort(comparator);
  }, [facilities, order, orderBy]);

  const handleToggleFacility = (facilityId) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId)
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing configurations for this feature
      const configSnapshot = await getDocs(collection(db, 'feature_configuration'));
      const deletePromises = configSnapshot.docs
        .filter(doc => doc.data().featureId === featureId)
        .map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Create new configurations
      const addPromises = selectedFacilities.map(facilityId => 
        setDoc(doc(collection(db, 'feature_configuration')), {
          featureId,
          facilityId,
          enabled: true,
          updatedAt: new Date()
        })
      );
      await Promise.all(addPromises);

      navigate('/admin/features');
    } catch (error) {
      console.error('Error saving configurations:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/features')}
          style={{ marginRight: '1rem' }}
        >
          Back
        </Button>
        <Typography variant="h5">Configure {feature.name}</Typography>
      </div>

      <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Typography variant="body1">
          <strong>Feature Key:</strong> {feature.key}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {feature.description}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedFacilities.length > 0 && selectedFacilities.length < facilities.length}
                  checked={facilities.length > 0 && selectedFacilities.length === facilities.length}
                  onChange={() => {
                    if (selectedFacilities.length === facilities.length) {
                      setSelectedFacilities([]);
                    } else {
                      setSelectedFacilities(facilities.map(f => f.id));
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Facility Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'location'}
                  direction={orderBy === 'location' ? order : 'asc'}
                  onClick={() => handleRequestSort('location')}
                >
                  Location
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'groupName'}
                  direction={orderBy === 'groupName' ? order : 'asc'}
                  onClick={() => handleRequestSort('groupName')}
                >
                  Facility Group
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFacilities.map((facility) => (
              <TableRow key={facility.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFacilities.includes(facility.id)}
                    onChange={() => handleToggleFacility(facility.id)}
                  />
                </TableCell>
                <TableCell>{facility.name}</TableCell>
                <TableCell>{facility.location}</TableCell>
                <TableCell>{facility.type}</TableCell>
                <TableCell>{facility.groupName || 'Unassigned'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default FeatureConfiguration; 