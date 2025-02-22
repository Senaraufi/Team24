import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { socket } from '../services/socket';

const CallCenterDashboard = () => {
  const [activeCall, setActiveCall] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [patientDetails, setPatientDetails] = useState({});
  const [urgencyLevel, setUrgencyLevel] = useState(null);

  useEffect(() => {
    // Listen for real-time updates
    socket.on('transcript_update', (data) => {
      setTranscript(prev => [...prev, data.transcript]);
      setPatientDetails(data.patient_details);
      setUrgencyLevel(data.urgency_level);
    });

    return () => {
      socket.off('transcript_update');
    };
  }, []);

  const handleStartCall = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-call', {
        method: 'POST',
      });
      const data = await response.json();
      setActiveCall(data.call_id);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleDispatchAmbulance = async () => {
    if (!activeCall) return;

    try {
      await fetch('http://localhost:5000/api/dispatch-ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: activeCall,
          location: patientDetails.location,
        }),
      });
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Call Center Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6">Live Transcript</Typography>
            <List>
              {transcript.map((line, index) => (
                <ListItem key={index}>
                  <ListItemText primary={line} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Patient Details</Typography>
            {Object.entries(patientDetails).map(([key, value]) => (
              <Typography key={key}>
                {key}: {value}
              </Typography>
            ))}
          </Paper>

          {urgencyLevel && (
            <Alert severity={urgencyLevel === 'HIGH' ? 'error' : 'warning'} sx={{ mb: 2 }}>
              Urgency Level: {urgencyLevel}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleStartCall}
            disabled={activeCall !== null}
            sx={{ mb: 2 }}
          >
            Start New Call
          </Button>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleDispatchAmbulance}
            disabled={!activeCall}
          >
            Dispatch Ambulance
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CallCenterDashboard;
