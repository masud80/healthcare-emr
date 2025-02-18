import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { auth } from '../firebase/config';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const DashboardCard = ({ title, icon, description, onClick }) => (
    <Grid item xs={12} md={4}>
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          height: '100%',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
        onClick={onClick}
      >
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Healthcare EMR
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Dashboard
        </Typography>
        <Grid container spacing={3}>
          <DashboardCard
            title="Patients"
            icon={<PeopleIcon fontSize="large" color="primary" />}
            description="Manage patient records, view histories, and update information"
            onClick={() => navigate('/patients')}
          />
          <DashboardCard
            title="Medical Records"
            icon={<AssignmentIcon fontSize="large" color="primary" />}
            description="Access and update patient medical records and treatment plans"
            onClick={() => navigate('/records')}
          />
          <DashboardCard
            title="Appointments"
            icon={<CalendarIcon fontSize="large" color="primary" />}
            description="Schedule and manage patient appointments"
            onClick={() => navigate('/appointments')}
          />
        </Grid>
        
        {role === 'admin' && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/users')}
            >
              Manage Users
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
