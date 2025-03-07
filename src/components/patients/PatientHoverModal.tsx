import React from 'react';
import { Box, Paper, Typography, Avatar, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface PatientHoverModalProps {
  patient: {
    name: string;
    profileImage?: string;
    facilityName: string;
    bloodType: string;
    bmi: number;
    medicalActivity?: {
      facilityName: string;
      date: string;
    }[];
  };
  onEditProfile: () => void;
}

const HoverModal = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: 300,
  padding: theme.spacing(2),
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  borderRadius: '12px',
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

const PatientHoverModal: React.FC<PatientHoverModalProps> = ({ patient, onEditProfile }) => {
  return (
    <HoverModal>
      <ProfileSection>
        <Avatar
          src={patient.profileImage}
          sx={{ width: 80, height: 80, marginBottom: 1 }}
        />
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
            {patient.bmi.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getBMICategory(patient.bmi)}
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
                {activity.date}
              </Typography>
            </Box>
          ))}
        </ActivitySection>
      )}
    </HoverModal>
  );
};

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export default PatientHoverModal; 