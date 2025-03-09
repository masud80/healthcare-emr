import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  fetchItems,
  fetchLowStockItems,
  fetchExpiringBatches,
} from '../../redux/slices/inventorySlice';
import ItemsList from './ItemsList';
import BatchManagement from './BatchManagement.jsx';
import SupplierManagement from './SupplierManagement';
import PurchaseOrders from './PurchaseOrders';
import LocationManagement from './LocationManagement.jsx';
import StockAlerts from './StockAlerts';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `inventory-tab-${index}`,
    'aria-controls': `inventory-tabpanel-${index}`,
  };
}

export default function InventoryManagement() {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const {
    items = [],
    lowStockItems = [],
    expiringBatches = [],
    loading,
    error,
  } = useSelector((state) => state.inventory);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchItems());
    dispatch(fetchLowStockItems());
    dispatch(fetchExpiringBatches(30)); // Check for items expiring in next 30 days

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      dispatch(fetchItems());
      dispatch(fetchLowStockItems());
      dispatch(fetchExpiringBatches(30));
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading && !items.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {(lowStockItems.length > 0 || expiringBatches.length > 0) && (
          <StockAlerts
            lowStockItems={lowStockItems}
            expiringBatches={expiringBatches}
          />
        )}

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="inventory management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Items" {...a11yProps(0)} />
            <Tab label="Batches" {...a11yProps(1)} />
            <Tab label="Suppliers" {...a11yProps(2)} />
            <Tab label="Purchase Orders" {...a11yProps(3)} />
            <Tab label="Locations" {...a11yProps(4)} />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <ItemsList items={items || []} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BatchManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SupplierManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <PurchaseOrders />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <LocationManagement />
        </TabPanel>
      </Box>
    </Container>
  );
} 