import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

function NewCallDialog({ open, onClose, patientDetails, onDetailsChange, onSubmit }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start New Emergency Call</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Patient Name"
          type="text"
          fullWidth
          value={patientDetails.name}
          onChange={(e) => onDetailsChange('name')(e)}
        />
        <TextField
          margin="dense"
          label="Age"
          type="number"
          fullWidth
          value={patientDetails.age}
          onChange={(e) => onDetailsChange('age')(e)}
        />
        <TextField
          margin="dense"
          label="Phone Number"
          type="tel"
          fullWidth
          value={patientDetails.phone}
          onChange={(e) => onDetailsChange('phone')(e)}
        />
        <TextField
          margin="dense"
          label="Initial Symptoms"
          multiline
          rows={4}
          fullWidth
          value={patientDetails.symptoms}
          onChange={(e) => onDetailsChange('symptoms')(e)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Start Call
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewCallDialog;
