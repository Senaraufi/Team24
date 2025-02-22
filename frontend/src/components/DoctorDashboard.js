import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { socket } from '../services/socket';

const DoctorDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [doctorId] = useState('DOC-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    socket.on('new_emergency', (data) => {
      setActiveEmergencies(prev => [...prev, data]);
    });

    socket.on('ambulance_dispatched', (data) => {
      // Update emergency status when ambulance is dispatched
      setActiveEmergencies(prev =>
        prev.map(emergency =>
          emergency.call_id === data.call_id
            ? { ...emergency, ambulance_status: data }
            : emergency
        )
      );
    });

    return () => {
      socket.off('new_emergency');
      socket.off('ambulance_dispatched');
    };
  }, []);

  const handleAvailabilityChange = async (event) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);

    try {
      await fetch('http://localhost:5000/api/doctor-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          status: newStatus ? 'available' : 'unavailable',
        }),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctor's Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityChange}
                  color="primary"
                />
              }
              label={`Status: ${isAvailable ? 'Available' : 'Unavailable'}`}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Active Emergencies
          </Typography>
          <Grid container spacing={2}>
            {activeEmergencies.map((emergency) => (
              <Grid item xs={12} md={6} key={emergency.call_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Emergency Case #{emergency.call_id}
                      <Chip
                        label={emergency.urgency_level}
                        color={emergency.urgency_level === 'HIGH' ? 'error' : 'warning'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>
                      Patient Details:
                    </Typography>
                    {Object.entries(emergency.patient_details).map(([key, value]) => (
                      <Typography key={key} variant="body2">
                        {key}: {value}
                      </Typography>
                    ))}

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Symptoms:
                    </Typography>
                    <List dense>
                      {emergency.symptoms.map((symptom, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={symptom} />
                        </ListItem>
                      ))}
                    </List>

                    {emergency.ambulance_status && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Ambulance ETA: {emergency.ambulance_status.estimated_arrival}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
