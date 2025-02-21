import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectRole } from '../../redux/slices/authSlice';
import FacilityFilter from '../facilities/FacilityFilter';
import GlobalSearch from '../search/GlobalSearch';
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
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const drawerWidth = 240;

const drawerStyles = {
  drawer: {
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: drawerWidth,
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid rgba(0, 0, 0, 0.12)'
    }
  },
  listItem: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  listItemSelected: {
    '&.Mui-selected': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.12)'
      }
    }
  },
  userInfo: {
    padding: '16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff'
  }
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

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
            sx={drawerStyles.listItem}
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
            sx={drawerStyles.listItem}
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
            sx={drawerStyles.listItem}
            selected={window.location.pathname === '/appointments'}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Appointments" />
          </ListItemButton>
        </ListItem>
        {(role === 'admin' || role === 'facility_admin') && (
          <ListItem component="div">
            <ListItemButton 
              onClick={() => navigate('/facilities')}
              sx={drawerStyles.listItem}
              selected={window.location.pathname === '/facilities'}
            >
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Facilities" />
            </ListItemButton>
          </ListItem>
        )}
        {(role === 'admin' || role === 'facility_admin') && (
          <List component="div" disablePadding>
            <ListItem component="div">
              <ListItemButton 
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                sx={drawerStyles.listItem}
              >
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <ListItemText primary="Administration" />
                  {adminMenuOpen ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </ListItemButton>
            </ListItem>
            <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {role === 'admin' && (
                  <>
                    <ListItem component="div">
                      <ListItemButton onClick={() => navigate('/admin/users')} sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="User Management" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem component="div">
                      <ListItemButton onClick={() => navigate('/audit')} sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary="Audit Report" />
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
            onClick={() => navigate('/billing')}
            sx={drawerStyles.listItem}
            selected={window.location.pathname === '/billing'}
          >
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Billing" />
          </ListItemButton>
        </ListItem>
        <ListItem component="div">
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              ...drawerStyles.listItem,
              marginTop: 2,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
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
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Healthcare EMR
            </Typography>
          </Box>
          <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
            <GlobalSearch />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <FacilityFilter />
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
