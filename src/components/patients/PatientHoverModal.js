import React from 'react';
import { Box, Paper, Typography, Avatar, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';

const HoverModal = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: 300,
  padding: theme.spacing(2),
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  borderRadius: '12px',
  backgroundColor: '#fff'
}));

const ProfileSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '16px',
});

const StatsSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: '16px',
  padding: '8px 0',
  borderTop: '1px solid #eee',
  borderBottom: '1px solid #eee',
});

const StatBox = styled(Box)({
  textAlign: 'center',
});

const ActivitySection = styled(Box)({
  marginTop: '16px',
});

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (name) => {
  const colors = [
    '#1976d2', // blue
    '#388e3c', // green
    '#d32f2f', // red
    '#7b1fa2', // purple
    '#c2185b', // pink
    '#0288d1', // light blue
    '#f57c00', // orange
    '#455a64'  // blue grey
  ];
  
  // Use the name to generate a consistent color
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const PatientHoverModal = ({ patient, onEditProfile }) => {
  const initials = getInitials(patient.name);
  const avatarColor = getRandomColor(patient.name);

  return (
    <HoverModal>
      <ProfileSection>
        <Avatar
          src={patient.profileImage}
          sx={{
            width: 80,
            height: 80,
            marginBottom: 1,
            bgcolor: !patient.profileImage ? avatarColor : undefined,
            fontSize: '2rem',
          }}
        >
          {!patient.profileImage && (initials || <PersonIcon />)}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {patient.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          size="small"
          onClick={onEditProfile}
        >
          Edit Profile
        </Button>
      </ProfileSection>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Medical Activity
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <LocalHospitalIcon color="primary" fontSize="small" />
          <Typography variant="body2">{patient.facilityName}</Typography>
        </Box>
      </Box>

      <StatsSection>
        <StatBox>
          <Typography variant="subtitle2" color="text.secondary">
            Blood Type
          </Typography>
          <Typography variant="h6" color="error">
            {patient.bloodType}
          </Typography>
        </StatBox>
        <StatBox>
          <Typography variant="subtitle2" color="text.secondary">
            BMI
          </Typography>
          <Typography variant="h6">
            {patient.bmi?.toFixed(1) || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {patient.bmi ? getBMICategory(patient.bmi) : ''}
          </Typography>
        </StatBox>
      </StatsSection>

      {patient.medicalActivity && patient.medicalActivity.length > 0 && (
        <ActivitySection>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Recent Activity
          </Typography>
          {patient.medicalActivity.map((activity, index) => (
            <Box key={index} mt={1}>
              <Typography variant="body2">
                {activity.facilityName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(activity.date).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </ActivitySection>
      )}
    </HoverModal>
  );
};

export default PatientHoverModal; 