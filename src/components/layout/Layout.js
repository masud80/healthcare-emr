import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectRole } from '../../redux/slices/authSlice';
import FacilityFilter from '../facilities/FacilityFilter';
import GlobalSearch from '../search/GlobalSearch';
import NotificationBell from '../notifications/NotificationBell';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  ListItemButton,
  Toolbar, 
  Typography,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { getDocs, query, collection, where, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const drawerWidth = 240;

// Add new styles for the modern theme
const modernStyles = {
  appBar: {
    background: 'linear-gradient(135deg, rgba(16, 20, 24, 0.75) 0%, rgba(0, 48, 46, 0.7) 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 255, 208, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 255, 208, 0.1)',
  },
  searchBox: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
  },
  iconButton: {
    color: '#00FFD0',
    '&:hover': {
      background: 'rgba(0, 255, 208, 0.1)',
    },
  },
  logo: {
    filter: 'brightness(1.2) contrast(1.1)',
  },
};

const drawerStyles = {
  drawer: {
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: drawerWidth,
      backgroundColor: '#0A192F',
      borderRight: '1px solid rgba(0, 255, 208, 0.1)',
      boxShadow: '4px 0 30px rgba(0, 255, 208, 0.05)',
      '& .MuiListItemIcon-root': {
        color: '#00FFD0',
        minWidth: '40px',
        fontSize: '0.9rem',
        transition: 'all 0.3s ease'
      },
      '& .MuiListItemText-primary': {
        fontSize: '0.875rem',
        color: '#E6F1FF',
        transition: 'all 0.3s ease'
      },
      '& .MuiListItemText-secondary': {
        fontSize: '0.75rem',
        color: 'rgba(230, 241, 255, 0.7)'
      },
      '& .MuiDivider-root': {
        borderColor: 'rgba(0, 255, 208, 0.1)'
      }
    },
    '& .MuiListItemButton-root': {
      minHeight: '40px',
      paddingTop: '4px',
      paddingBottom: '4px',
      position: 'relative',
      transition: 'all 0.3s ease',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '3px',
        background: '#00FFD0',
        opacity: 0,
        transform: 'scaleY(0)',
        transition: 'transform 0.3s ease, opacity 0.3s ease'
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 255, 208, 0.1)',
        '& .MuiListItemIcon-root': {
          transform: 'translateX(5px)',
          color: '#00FFD0'
        },
        '& .MuiListItemText-primary': {
          transform: 'translateX(5px)',
          color: '#00FFD0'
        },
        '&::before': {
          opacity: 1,
          transform: 'scaleY(1)'
        }
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(0, 255, 208, 0.15)',
        '&::before': {
          opacity: 1,
          transform: 'scaleY(1)'
        },
        '& .MuiListItemIcon-root': {
          color: '#00FFD0'
        },
        '& .MuiListItemText-primary': {
          color: '#00FFD0',
          fontWeight: 600
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 255, 208, 0.2)'
        }
      },
      '&:active': {
        transform: 'scale(0.98)',
        '& .MuiListItemIcon-root': {
          transform: 'scale(0.95)'
        }
      }
    }
  },
  userInfo: {
    padding: '16px',
    borderBottom: '1px solid rgba(0, 255, 208, 0.1)',
    backgroundColor: 'rgba(0, 255, 208, 0.05)',
    backdropFilter: 'blur(10px)',
    '& .MuiTypography-subtitle1': {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#00FFD0'
    },
    '& .MuiTypography-body2': {
      fontSize: '0.8rem',
      color: '#E6F1FF'
    },
    '& .MuiTypography-caption': {
      fontSize: '0.75rem',
      color: 'rgba(0, 255, 208, 0.7)'
    }
  },
  dashboard: {
    '& .MuiListItemIcon-root': { color: '#00FFD0' }
  },
  patients: {
    '& .MuiListItemIcon-root': { color: '#00E5FF' }
  },
  appointments: {
    '& .MuiListItemIcon-root': { color: '#00BFA5' }
  },
  facilities: {
    '& .MuiListItemIcon-root': { color: '#64FFDA' }
  },
  admin: {
    '& .MuiListItemIcon-root': { color: '#1DE9B6' }
  },
  billing: {
    '& .MuiListItemIcon-root': { color: '#00E676' }
  },
  messaging: {
    '& .MuiListItemIcon-root': { color: '#69F0AE' }
  },
  account: {
    '& .MuiListItemIcon-root': { color: '#B2FFDA' }
  },
  userManagement: {
    '& .MuiListItemIcon-root': { color: '#00E5B9' }
  },
  pharmacyManagement: {
    '& .MuiListItemIcon-root': { color: '#00D6B1' }
  },
  auditReport: {
    '& .MuiListItemIcon-root': { color: '#00C8A8' }
  },
  rolePermissions: {
    '& .MuiListItemIcon-root': { color: '#00BBA0' }
  },
  facilityGroups: {
    '& .MuiListItemIcon-root': { color: '#00AD97' }
  },
  billingCodes: {
    '& .MuiListItemIcon-root': { color: '#009F8E' }
  },
  featureConfig: {
    '& .MuiListItemIcon-root': { color: '#009185' }
  },
  inventoryManagement: {
    '& .MuiListItemIcon-root': { color: '#00847C' }
  }
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  console.log('Current user role:', role);
  const [facilityBranding, setFacilityBranding] = useState(null);

  useEffect(() => {
    const fetchFacilityBranding = async () => {
      if (!user) return;

      try {
        // Get user's current facility
        const userFacilityDoc = await getDocs(
          query(
            collection(db, 'user_facilities'),
            where('userId', '==', user.uid),
            limit(1)
          )
        );

        if (!userFacilityDoc.empty) {
          const facilityId = userFacilityDoc.docs[0].data().facilityId;
          const facilityDoc = await getDoc(doc(db, 'facilities', facilityId));
          
          if (facilityDoc.exists() && facilityDoc.data().branding) {
            setFacilityBranding(facilityDoc.data().branding);
          }
        }
      } catch (error) {
        console.error('Error fetching facility branding:', error);
      }
    };

    fetchFacilityBranding();
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const capitalizeRole = (role) => {
    return role?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add a function to check if the current route needs facility filtering
  const shouldShowFacilityFilter = () => {
    const path = window.location.pathname;
    // Add routes that need facility filtering
    const facilitiesRoutes = [
      '/dashboard',
      '/patients',
      '/appointments',
      '/facilities',
      '/bills',
      '/prescriptions'
    ];
    return facilitiesRoutes.some(route => path.startsWith(route));
  };

  const drawer = (
    <Box>
      {user && (
        <Box sx={drawerStyles.userInfo}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.main' }}>
            {capitalizeRole(user.role)}
          </Typography>
        </Box>
      )}
      <List>
        <ListItem component="div">
          <ListItemButton 
            onClick={() => navigate('/dashboard')}
            sx={{ ...drawerStyles.listItem, ...drawerStyles.dashboard }}
            selected={window.location.pathname === '/dashboard'}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem component="div">
          <ListItemButton 
            onClick={() => navigate('/patients')}
            sx={{ ...drawerStyles.listItem, ...drawerStyles.patients }}
            selected={window.location.pathname === '/patients'}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Patients" />
          </ListItemButton>
        </ListItem>
        <ListItem component="div">
          <ListItemButton 
            onClick={() => navigate('/appointments')}
            sx={{ ...drawerStyles.listItem, ...drawerStyles.appointments }}
            selected={window.location.pathname === '/appointments'}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Appointments" />
          </ListItemButton>
        </ListItem>
        {/* Facilities menu item - visible to admin and facility_admin */}
        <ListItem component="div">
          <ListItemButton 
            onClick={() => navigate('/facilities')}
            sx={{ ...drawerStyles.listItem, ...drawerStyles.facilities }}
            selected={window.location.pathname === '/facilities'}
          >
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Facilities" />
          </ListItemButton>
        </ListItem>
        {(role === 'admin' || role === 'facility_admin') && (
          <List component="div" disablePadding>
            <ListItem component="div">
              <ListItemButton 
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                sx={{ ...drawerStyles.listItem, ...drawerStyles.admin }}
              >
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <ListItemText primary="Administration" />
                  {adminMenuOpen ? 
                    <ExpandLess sx={{ color: '#E6F1FF' }} /> : 
                    <ExpandMore sx={{ color: '#E6F1FF' }} />
                  }
                </Box>
              </ListItemButton>
            </ListItem>
            <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ '& .MuiListItem-root': { py: 0 } }}>
                {role === 'admin' && (
                  <>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/audit')} 
                        sx={{ pl: 4, ...drawerStyles.auditReport }}
                      >
                        <ListItemIcon>
                          <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary="Audit Report" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/billing-codes')} 
                        sx={{ pl: 4, ...drawerStyles.billingCodes }}
                      >
                        <ListItemIcon>
                          <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary="Billing Codes" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/facility-groups')} 
                        sx={{ pl: 4, ...drawerStyles.facilityGroups }}
                      >
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText primary="Facility Groups" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/features')} 
                        sx={{ pl: 4, ...drawerStyles.featureConfig }}
                      >
                        <ListItemIcon>
                          <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Feature Configuration" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/inventory')} 
                        sx={{ pl: 4, ...drawerStyles.inventoryManagement }}
                      >
                        <ListItemIcon>
                          <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Inventory Management" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/pharmacies')} 
                        sx={{ pl: 4, ...drawerStyles.pharmacyManagement }}
                      >
                        <ListItemIcon>
                          <LocalPharmacyIcon />
                        </ListItemIcon>
                        <ListItemText primary="Pharmacy Management" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/role-permissions')} 
                        sx={{ pl: 4, ...drawerStyles.rolePermissions }}
                      >
                        <ListItemIcon>
                          <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Role Permissions" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton 
                        onClick={() => navigate('/admin/users')} 
                        sx={{ pl: 4, ...drawerStyles.userManagement }}
                      >
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="User Management" />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </Collapse>
          </List>
        )}
        <ListItem component="div">
          <ListItemButton 
            onClick={() => navigate(role === 'admin' ? '/admin/billing' : '/billing')}
            sx={{ ...drawerStyles.listItem, ...drawerStyles.billing }}
            selected={window.location.pathname.includes('billing')}
          >
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Billing" />
          </ListItemButton>
        </ListItem>
        {/* Add Secure Messaging navigation item - visible to admin, doctor, and nurse */}
        {(role === 'admin' || role === 'doctor' || role === 'nurse') && (
          <ListItem component="div">
            <ListItemButton 
              onClick={() => navigate('/messaging')}
              sx={{ ...drawerStyles.listItem, ...drawerStyles.messaging }}
              selected={window.location.pathname.startsWith('/messaging')}
            >
              <ListItemIcon>
                <MessageIcon />
              </ListItemIcon>
              <ListItemText primary="Secure Messaging" />
            </ListItemButton>
          </ListItem>
        )}
        {user && ( // Only show My Account link for logged-in users
          <ListItem component="div">
            <ListItemButton 
              onClick={() => navigate('/my-account')}
              sx={{ ...drawerStyles.listItem, ...drawerStyles.account }}
              selected={window.location.pathname === '/my-account'}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="My Account" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem component="div">
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              marginTop: 2,
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 59, 48, 0.2)',
              },
              '& .MuiListItemIcon-root': {
                color: '#FF3B30'
              },
              '& .MuiListItemText-primary': {
                color: '#FF3B30'
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          ...modernStyles.appBar,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              sx={{ ...modernStyles.iconButton, mr: 2, display: { sm: 'none' } }}
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img 
                src="/logo.svg" 
                alt="QuantumLeap Logo" 
                style={{ height: 30, ...modernStyles.logo }}
              />
              <Box>
                {facilityBranding?.facilityName && (
                  <Typography 
                    variant="subtitle2" 
                    noWrap 
                    component="div"
                    sx={{ color: '#00FFD0' }}
                  >
                    {facilityBranding.facilityName}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ 
            flex: 2, 
            display: 'flex', 
            justifyContent: 'center',
            '& .MuiInputBase-root': modernStyles.searchBox,
          }}>
            <GlobalSearch />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 2 }}>
            {user && <NotificationBell />}
            {user && shouldShowFacilityFilter() && (
              <Box sx={{ '& .MuiInputBase-root': modernStyles.searchBox }}>
                <FacilityFilter />
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            ...drawerStyles.drawer,
            display: { xs: 'block', sm: 'none' }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            ...drawerStyles.drawer,
            display: { xs: 'none', sm: 'block' }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
