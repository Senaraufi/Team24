import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useEmergency } from '../context/EmergencyContext';
import { updateDoctorStatus } from '../services/api';

function DoctorDashboard() {
  const {
    activeCall,
    patientDetails,
    symptoms,
    severityScore,
    dispatchInfo,
  } = useEmergency();

  const [doctorId] = useState('doc1'); // In a real app, this would come from authentication
  const [isAvailable, setIsAvailable] = useState(true);
  const [instructions, setInstructions] = useState('');

  const handleAvailabilityChange = async (event) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);
    await updateDoctorStatus(doctorId, newStatus ? 'available' : 'unavailable');
  };

  const handleInstructionsChange = (event) => {
    setInstructions(event.target.value);
  };

  const handleSendInstructions = () => {
    // In a real app, this would send instructions to the ambulance crew
    console.log('Sending instructions:', instructions);
    setInstructions('');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Doctor's Dashboard
        </Typography>
        <Card sx={{ bgcolor: isAvailable ? 'success.light' : 'error.light', px: 2, py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={handleAvailabilityChange}
                color={isAvailable ? 'success' : 'error'}
              />
            }
            label={
              <Typography color={isAvailable ? 'success.dark' : 'error.dark'}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Typography>
            }
          />
        </Card>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {activeCall ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Emergency
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Alert severity="warning" icon={false} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        animation: 'pulse 2s infinite',
                        mr: 2
                      }}
                    />
                    <Typography variant="body2">
                      Emergency in Progress
                    </Typography>
                  </Box>
                </Alert>
              </Box>

              {patientDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color="text.secondary">Name:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{patientDetails.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="text.secondary">Age:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{patientDetails.age}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="text.secondary">Location:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{patientDetails.location}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Symptoms
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      label={symptom}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Severity
                </Typography>
                <Chip
                  label={`Score: ${severityScore}/10`}
                  color={
                    severityScore >= 8 ? 'error' :
                    severityScore >= 5 ? 'warning' : 'success'
                  }
                />
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No Active Emergency
              </Typography>
              <Typography color="text.secondary">
                You will be notified when a new emergency arrives.
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical Instructions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                multiline
                rows={4}
                value={instructions}
                onChange={handleInstructionsChange}
                placeholder="Enter medical instructions for the ambulance crew..."
                variant="outlined"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleSendInstructions}
                disabled={!activeCall || !instructions.trim()}
                fullWidth
              >
                Send Instructions
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DoctorDashboard;
