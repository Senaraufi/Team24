import React from 'react';
import {
  TextField,
  Box,
  Typography,
} from '@mui/material';

function PatientDetailsForm({ isEditing, patientDetails, editedDetails, onDetailsChange }) {
  if (isEditing) {
    return (
      <Box>
        <TextField
          fullWidth
          margin="dense"
          label="Name"
          value={editedDetails.name || ''}
          onChange={(e) => onDetailsChange('name')(e)}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Age"
          type="number"
          value={editedDetails.age || ''}
          onChange={(e) => onDetailsChange('age')(e)}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Phone"
          value={editedDetails.phone || ''}
          onChange={(e) => onDetailsChange('phone')(e)}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography><strong>Name:</strong> {patientDetails?.name || 'Not provided'}</Typography>
      <Typography><strong>Age:</strong> {patientDetails?.age || 'Not provided'}</Typography>
      <Typography><strong>Phone:</strong> {patientDetails?.phone || 'Not provided'}</Typography>
    </Box>
  );
}

export default PatientDetailsForm;
