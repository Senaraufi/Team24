import React, { useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useEmergency } from '../context/EmergencyContext';
import { findNearestAmbulance, dispatchAmbulance } from '../services/api';
import EmergencyMap from './EmergencyMap';

function CallCenterDashboard() {
  const {
    activeCall,
    transcript,
    patientDetails,
    symptoms,
    severityScore,
    dispatchInfo,
    startEmergencyCall,
  } = useEmergency();

  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);

  const handleStartCall = async () => {
    await startEmergencyCall();
    // In a real app, we would get the actual location from the emergency call
    setEmergencyLocation({ lat: 53.3498, lng: -6.2603 });
  };

  const handleDispatchAmbulance = async () => {
    if (!activeCall) return;

    const location = { lat: 53.3498, lng: -6.2603 }; // Dublin city center
    const nearest = await findNearestAmbulance(location);
    
    if (nearest) {
      await dispatchAmbulance(activeCall, location);
      // In a real app, we would get the actual ambulance location
      setAmbulanceLocation({ lat: 53.3488, lng: -6.2613 });
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Call Center Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartCall}
          disabled={activeCall}
        >
          Start New Call
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Emergency Map
            </Typography>
            <EmergencyMap
              emergencyLocation={emergencyLocation}
              ambulanceLocation={ambulanceLocation}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Call Control
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDispatchAmbulance}
              disabled={!activeCall}
              fullWidth
            >
              Dispatch Ambulance
            </Button>
            {activeCall && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography color="success.dark">
                  Active Call in Progress
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Details
            </Typography>
            {patientDetails ? (
              <List>
                <ListItem>
                  <ListItemText primary="Name" secondary={patientDetails.name} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Age" secondary={patientDetails.age} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Location" secondary={patientDetails.location} />
                </ListItem>
              </List>
            ) : (
              <Typography color="text.secondary">No active call</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Emergency Details
            </Typography>
            {activeCall ? (
              <Box sx={{ '& > *': { mb: 2 } }}>
                <div>
                  <Typography variant="subtitle1" gutterBottom>
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
                </div>

                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Severity Score
                  </Typography>
                  <Chip
                    label={`${severityScore}/10`}
                    color={severityScore >= 8 ? 'error' : severityScore >= 5 ? 'warning' : 'success'}
                  />
                </div>

                {transcript && (
                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Call Transcript
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        maxHeight: 200,
                        overflow: 'auto',
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Typography variant="body2">
                        {transcript}
                      </Typography>
                    </Paper>
                  </div>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">No active call</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CallCenterDashboard;
