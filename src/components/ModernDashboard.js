import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 208, 0.2); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 208, 0.4); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 208, 0.2); }
`;

// Styled Components
const DashboardCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(16, 20, 24, 0.9) 0%, rgba(0, 48, 46, 0.8) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 255, 208, 0.1)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  color: '#fff',
  transition: 'all 0.3s ease',
  animation: `${glowAnimation} 3s infinite`,
  '&:hover': {
    transform: 'translateY(-5px)',
    animation: `${pulseAnimation} 1s infinite`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 255, 208, 0.2) 0%, rgba(0, 108, 103, 0.2) 100%)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

// Sample data
const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

const ModernDashboard = () => {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box sx={{ p: 4, background: '#0A192F', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 600 }}>
        Healthcare Dashboard
      </Typography>
      
      {/* Top Stats Row */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Quick Stats Cards */}
        <Grid item xs={12} md={3}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <DashboardCard>
              <IconWrapper>
                <PeopleIcon sx={{ fontSize: 40, color: '#00FFD0' }} />
              </IconWrapper>
              <Typography variant="h6" sx={{ mb: 1 }}>Total Patients</Typography>
              <Typography variant="h4">1,234</Typography>
              <Typography variant="body2" sx={{ color: '#00FFD0', mt: 1 }}>
                +12% from last month
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardCard>
              <IconWrapper>
                <LocalHospitalIcon sx={{ fontSize: 40, color: '#00FFD0' }} />
              </IconWrapper>
              <Typography variant="h6" sx={{ mb: 1 }}>Appointments</Typography>
              <Typography variant="h4">42</Typography>
              <Typography variant="body2" sx={{ color: '#00FFD0', mt: 1 }}>
                Today's Schedule
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DashboardCard>
              <IconWrapper>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#00FFD0' }} />
              </IconWrapper>
              <Typography variant="h6" sx={{ mb: 1 }}>Revenue</Typography>
              <Typography variant="h4">$52.5k</Typography>
              <Typography variant="body2" sx={{ color: '#00FFD0', mt: 1 }}>
                +8% this week
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <DashboardCard>
              <IconWrapper>
                <TimelineIcon sx={{ fontSize: 40, color: '#00FFD0' }} />
              </IconWrapper>
              <Typography variant="h6" sx={{ mb: 1 }}>Patient Satisfaction</Typography>
              <Typography variant="h4">94%</Typography>
              <Typography variant="body2" sx={{ color: '#00FFD0', mt: 1 }}>
                Based on 420 reviews
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Bottom Row - Charts and Notifications */}
      <Grid container spacing={4}>
        {/* Patient Trends Chart */}
        <Grid item xs={12} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <DashboardCard sx={{ height: '400px' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Patient Trends</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(16, 20, 24, 0.9)',
                      border: '1px solid rgba(0, 255, 208, 0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#00FFD0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>
          </motion.div>
        </Grid>

        {/* Notifications Card */}
        <Grid item xs={12} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <DashboardCard sx={{ height: '400px', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconWrapper sx={{ mr: 2, p: 1 }}>
                  <NotificationsIcon sx={{ fontSize: 24, color: '#00FFD0' }} />
                </IconWrapper>
                <Typography variant="h6">Recent Notifications</Typography>
              </Box>
              <Box sx={{ 
                height: 'calc(100% - 80px)', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 255, 208, 0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(0, 255, 208, 0.3)',
                  },
                },
              }}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 255, 208, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(5px)',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: '#00FFD0', mb: 1 }}>
                      {['New Patient Admitted', 'Appointment Scheduled', 'Lab Results Ready', 'Prescription Updated', 'Patient Discharged'][index]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {['Dr. Smith admitted John Doe for routine checkup', 
                        'Sarah Johnson scheduled for follow-up on Monday', 
                        'Blood test results available for Michael Brown',
                        'Updated prescription for Emma Wilson',
                        'David Clark discharged after successful treatment'][index]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1, display: 'block' }}>
                      {['2 hours ago', '4 hours ago', 'Yesterday', '2 days ago', '3 days ago'][index]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </DashboardCard>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernDashboard; 