import { FormControlLabel, Checkbox } from '@mui/material';
import { useState, FormEvent } from 'react';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    isPatientPortalEnabled: false
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.isPatientPortalEnabled || false}
            onChange={(e) => setFormData({
              ...formData,
              isPatientPortalEnabled: e.target.checked
            })}
          />
        }
        label="Enable Patient Portal"
      />
    </form>
  );
};

export default PatientForm; 