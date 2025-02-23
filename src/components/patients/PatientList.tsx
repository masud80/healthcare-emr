import { Checkbox } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const PatientList = () => {
  const handlePatientPortalToggle = async (patientId: string, newValue: boolean) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        isPatientPortalEnabled: newValue
      });
    } catch (error) {
      console.error('Error updating patient portal access:', error);
      // You might want to add proper error handling/notification here
    }
  };

  const columns = [
    {
      field: 'isPatientPortalEnabled',
      headerName: 'Enable Patient Portal',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={params.row.isPatientPortalEnabled || false}
          onChange={(event) => handlePatientPortalToggle(params.row.id, event.target.checked)}
        />
      ),
    },
  ];

  // ... rest of the component code ...
};

export default PatientList; 