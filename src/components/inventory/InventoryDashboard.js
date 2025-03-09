import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Assignment as OrdersIcon,
  Category as CategoryIcon,
  Business as SuppliersIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchItems, fetchLowStockItems } from '../../redux/slices/inventorySlice';
import ItemsList from './ItemsList.js';
import PurchaseOrders from './PurchaseOrders.jsx';
import SupplierManagement from './SupplierManagement.jsx';

const InventoryDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const dispatch = useDispatch();
  const { items = [], lowStockItems = [], loading, error } = useSelector((state) => state.inventory);
  
  console.log('InventoryDashboard rendering, currentTab:', currentTab);
  console.log('Items from Redux:', items);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchItems());
    dispatch(fetchLowStockItems());
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      dispatch(fetchItems());
      dispatch(fetchLowStockItems());
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    console.log('Tab changed to:', newValue);
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    dispatch(fetchItems());
    dispatch(fetchLowStockItems());
  };

  const renderTabContent = () => {
    console.log('Rendering tab content for tab:', currentTab);
    
    if (loading && currentTab === 1) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      );
    }
    
    switch (currentTab) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Items
                      </Typography>
                      <Typography variant="h4">{items.length}</Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Low Stock Items
                      </Typography>
                      <Typography variant="h4">{lowStockItems.length}</Typography>
                    </Box>
                    <ShippingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Orders
                      </Typography>
                      <Typography variant="h4">12</Typography>
                    </Box>
                    <OrdersIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 1: // Items
        return <ItemsList items={items} />;
      case 2: // Purchase Orders
        return <PurchaseOrders />;
      case 3: // Categories
        return <Typography>Categories management coming soon...</Typography>;
      case 4: // Suppliers
        return <SupplierManagement />;
      default:
        return <Typography>Select a tab</Typography>;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
          <Box>
            <IconButton title="Refresh data" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 1 }}
            >
              New Item
            </Button>
          </Box>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<InventoryIcon />} label="Overview" />
            <Tab icon={<InventoryIcon />} label="Items" />
            <Tab icon={<OrdersIcon />} label="Purchase Orders" />
            <Tab icon={<CategoryIcon />} label="Categories" />
            <Tab icon={<SuppliersIcon />} label="Suppliers" />
          </Tabs>
        </Paper>
      </Box>
      <Box sx={{ mt: 3 }}>
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default InventoryDashboard; 