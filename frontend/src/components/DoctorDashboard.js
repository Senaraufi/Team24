import React, { useState, useEffect } from 'react';
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
  const [patientUpdates, setPatientUpdates] = useState([]);
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '120/80',
    heartRate: '72',
    oxygenSaturation: '98',
    temperature: '36.8'
  });

  // Simulate real-time patient updates
  useEffect(() => {
    if (activeCall) {
      const interval = setInterval(() => {
        // Update vital signs
        setVitalSigns(prev => ({
          bloodPressure: Math.floor(110 + Math.random() * 40) + '/' + Math.floor(70 + Math.random() * 20),
          heartRate: Math.floor(60 + Math.random() * 40).toString(),
          oxygenSaturation: Math.floor(95 + Math.random() * 5).toString(),
          temperature: (36.5 + Math.random()).toFixed(1)
        }));

        // Add new patient update
        const update = generatePatientUpdate();
        setPatientUpdates(prev => [update, ...prev.slice(0, 9)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeCall]);

  const generatePatientUpdate = () => {
    const updates = [
      { type: 'vital', text: `Blood Pressure: ${vitalSigns.bloodPressure} mmHg` },
      { type: 'vital', text: `Heart Rate: ${vitalSigns.heartRate} bpm` },
      { type: 'vital', text: `O2 Saturation: ${vitalSigns.oxygenSaturation}%` },
      { type: 'symptom', text: 'Patient reporting increased chest pain' },
      { type: 'treatment', text: 'Administered prescribed medication' },
      { type: 'status', text: 'Patient stable and responsive' }
    ];
    return {
      ...updates[Math.floor(Math.random() * updates.length)],
      timestamp: new Date().toLocaleTimeString(),
      id: Math.random().toString(36).substr(2, 9)
    };
  };

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Current Emergency
                </Typography>
                {severityScore >= 8 && (
                  <Chip
                    label="URGENT CARE NEEDED"
                    color="error"
                    sx={{ animation: 'pulse 1.5s infinite' }}
                  />
                )}
              </Box>
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
                  Vital Signs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                      <Typography variant="body2" color="primary.contrastText">Blood Pressure</Typography>
                      <Typography variant="h6" color="primary.contrastText">{vitalSigns.bloodPressure}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                      <Typography variant="body2" color="secondary.contrastText">Heart Rate</Typography>
                      <Typography variant="h6" color="secondary.contrastText">{vitalSigns.heartRate}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <Typography variant="body2" color="success.contrastText">O2 Sat</Typography>
                      <Typography variant="h6" color="success.contrastText">{vitalSigns.oxygenSaturation}%</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                      <Typography variant="body2" color="warning.contrastText">Temp</Typography>
                      <Typography variant="h6" color="warning.contrastText">{vitalSigns.temperature}°C</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Symptoms & Severity
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      label={symptom}
                      color={severityScore >= 8 ? 'error' : 'primary'}
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`Severity: ${severityScore}/10`}
                    color={severityScore >= 8 ? 'error' : severityScore >= 5 ? 'warning' : 'success'}
                    sx={{ fontWeight: 'bold' }}
                  />
                  {severityScore >= 8 && (
                    <Typography variant="body2" color="error">
                      Immediate attention required
                    </Typography>
                  )}
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                    error={!instructions.trim() && activeCall}
                    helperText={!instructions.trim() && activeCall ? 'Please provide instructions for the ambulance crew' : ''}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendInstructions}
                    disabled={!activeCall || !instructions.trim()}
                    fullWidth
                    color="primary"
                    sx={{
                      height: 48,
                      fontWeight: 'bold',
                      '&:not(:disabled)': {
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                      }
                    }}
                  >
                    Send Instructions to Ambulance Crew
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Real-time Updates
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {patientUpdates.map((update) => (
                    <Box
                      key={update.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: update.type === 'vital' ? 'primary.light' :
                                update.type === 'symptom' ? 'warning.light' :
                                'success.light',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {update.type.toUpperCase()}
                        </Typography>
                        <Typography variant="caption">
                          {update.timestamp}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {update.text}
                      </Typography>
                    </Box>
                  ))}
                  {patientUpdates.length === 0 && (
                    <Typography color="text.secondary" textAlign="center">
                      No updates yet
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DoctorDashboard;
