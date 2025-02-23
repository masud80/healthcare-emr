import { FormControlLabel, Checkbox } from '@mui/material';

const PatientForm = () => {
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