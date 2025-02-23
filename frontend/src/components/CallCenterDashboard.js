import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useEmergency } from '../context/EmergencyContext';
import { findNearestAmbulance, dispatchAmbulance } from '../services/api';
import { PatientContext } from '../context/PatientContext';
import { savePatientData } from '../utils/api';
import { startTextToSpeech, stopTextToSpeech } from '../services/textToSpeech'; // Import text-to-speech functions
import { startLiveTranscription, stopLiveTranscription } from '../services/liveTranscription'; // Import live transcription functions
import './CallCenterDashboard.css'; // Import the CSS file

const center = {
  lat: 53.3498, // Dublin city center
  lng: -6.2603,
};

const fetchNearbyHospitals = async (lat, lng) => {
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:20000, ${lat}, ${lng});
      way["amenity"="hospital"](around:20000, ${lat}, ${lng});
      relation["amenity"="hospital"](around:20000, ${lat}, ${lng});
    );
    out center;
  `;
  const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.elements;
};

const fetchRouteTimeAndDistance = async (startLat, startLng, endLat, endLng) => {
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`);
  const data = await response.json();
  const route = data.routes[0];
  return { time: route.duration, distance: route.distance };
};

const CallCenterDashboard = () => {
  const [newCallDialogOpen, setNewCallDialogOpen] = useState(false);
  const [newPatientDetails, setNewPatientDetails] = useState({
    name: '',
    age: '',
    phone: '',
    symptoms: '',
    address: ''
  });
  const [addressWarning, setAddressWarning] = useState(false); // State for address warning
  const {
    activeCall,
    transcript,
    patientDetails,
    symptoms,
    severityScore,
    dispatchInfo,
    startEmergencyCall,
    updatePatientDetails,
  } = useEmergency();

  const { addPatient } = useContext(PatientContext);
  const addressRef = useRef(null); // Create a ref for the address section

  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState(false);
  const [editedPatientDetails, setEditedPatientDetails] = useState({});
  const [liveTranscript, setLiveTranscript] = useState('');
  const [extractedSymptoms, setExtractedSymptoms] = useState([]);
  
  // Simulate live transcription updates
  useEffect(() => {
    if (activeCall) {
      const interval = setInterval(() => {
        setLiveTranscript(prev => prev + ' ' + generateTranscriptUpdate());
        if (Math.random() > 0.7) {
          setExtractedSymptoms(prev => [...prev, generateSymptom()]);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeCall]);

  const generateTranscriptUpdate = () => {
    const updates = [
      'Patient complaining of chest pain',
      'Difficulty breathing',
      'Started 30 minutes ago',
      'No prior history',
      'Taking regular medication'
    ];
    return updates[Math.floor(Math.random() * updates.length)];
  };

  const generateSymptom = () => {
    const possibleSymptoms = [
      { text: 'Chest Pain', severity: 'high' },
      { text: 'Shortness of Breath', severity: 'high' },
      { text: 'Dizziness', severity: 'medium' },
      { text: 'Nausea', severity: 'medium' },
      { text: 'Sweating', severity: 'low' }
    ];
    return possibleSymptoms[Math.floor(Math.random() * possibleSymptoms.length)];
  };

  const handleEditDetails = () => {
    setEditedPatientDetails(patientDetails || {});
    setEditingDetails(true);
  };

  const handleNewPatientDetailsChange = (field) => (event) => {
    setNewPatientDetails({
      ...newPatientDetails,
      [field]: event.target.value
    });
  };

  const handlePatientDetailsChange = (field) => (event) => {
    setEditedPatientDetails({
      ...editedPatientDetails,
      [field]: event.target.value
    });
  };

  const handleSaveDetails = () => {
    updatePatientDetails(editedPatientDetails);
    setEditingDetails(false);
    setVerifiedDetails(true);
  };

  const handleStartCall = async () => {
    setNewCallDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setNewCallDialogOpen(false);
  };

  const handleSubmitNewCall = async () => {
    console.log('Starting new call with details:', newPatientDetails);
    try {
      const callId = await startEmergencyCall();
      console.log('Got call ID:', callId);
      
      if (callId) {
        console.log('Setting emergency location...');
        setEmergencyLocation({ lat: 53.3498, lng: -6.2603 });
        
        console.log('Updating patient details...');
        const updated = await updatePatientDetails(newPatientDetails);
        
        if (updated) {
          console.log('Successfully updated patient details');
          setNewCallDialogOpen(false);
          startLiveTranscription(); // Start live transcription
        } else {
          console.error('Failed to update patient details');
        }
      } else {
        console.error('Failed to start emergency call');
      }
    } catch (error) {
      console.error('Error in handleSubmitNewCall:', error);
    }

    const newCall = {
      id: Date.now().toString(),
      number: '123-456-7890',
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      address: newPatientDetails.address,
    };
    addPatient(newCall);
    try {
      await savePatientData(newCall);
    } catch (error) {
      console.error('Failed to save patient data', error);
    }
  };

  const handleDispatchAmbulance = async () => {
    if (!activeCall) return;

    if (!newPatientDetails.address) {
      setAddressWarning(true);
      if (addressRef.current) {
        addressRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const location = { lat: 53.3498, lng: -6.2603 }; // Dublin city center
    const nearest = await findNearestAmbulance(location);
    
    if (nearest) {
      await dispatchAmbulance(activeCall, location);
      // In a real app, we would get the actual ambulance location
      setAmbulanceLocation({ lat: 53.3488, lng: -6.2613 });
    }
  };

  const handleSubmitAddress = () => {
    console.log('Address submitted:', newPatientDetails.address);
    // Update patient details with the new address
    updatePatientDetails({
      ...patientDetails,
      address: newPatientDetails.address
    });
    setAddressWarning(false); // Clear the warning
  };

  useEffect(() => {
    if (activeCall) {
      startTextToSpeech();
    } else {
      stopTextToSpeech();
      stopLiveTranscription(); // Stop live transcription
    }
  }, [activeCall]);

  return (
    <Box className="dashboard-container">
      <Box className="header-container">
        <Typography variant="h4">
          Call Center Dashboard
        </Typography>
        <Box>
          {severityScore >= 8 && (
            <Chip
              icon={<WarningIcon />}
              label="CRITICAL EMERGENCY"
              color="error"
              className="critical-emergency-chip"
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartCall}
            disabled={activeCall}
          >
            Start New Call
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="map-container">
            <Typography variant="h6" gutterBottom>
              Emergency Map
            </Typography>
            <iframe
              title="Map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05},${center.lat - 0.05},${center.lng + 0.05},${center.lat + 0.05}&layer=mapnik`}
              className="map-iframe"
            ></iframe>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="call-control-container">
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
              <Box className="active-call-box">
                <Typography color="success.dark">
                  Active Call in Progress
                </Typography>
              </Box>
            )}
            <Box className="patient-details-box">
              <Typography variant="h6" gutterBottom>
                Patient Details
              </Typography>
              {patientDetails ? (
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Name:" 
                      secondary={patientDetails.name || 'Not provided'}
                      secondaryTypographyProps={{
                        color: verifiedDetails ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Age:" 
                      secondary={patientDetails.age || 'Not provided'}
                      secondaryTypographyProps={{
                        color: verifiedDetails ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Location:" 
                      secondary={patientDetails.location || 'Not provided'}
                      secondaryTypographyProps={{
                        color: verifiedDetails ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color="text.secondary">No active call</Typography>
              )}
            </Box>
            <Box className="emergency-details-box">
              <Typography variant="h6" gutterBottom>
                Emergency Details
              </Typography>
              {activeCall ? (
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Symptoms
                    </Typography>
                    <Box className="symptoms-box">
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

                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Live Transcription
                    </Typography>
                    <Paper className="live-transcription-box">
                      {activeCall && (
                        <Box className="live-indicator">
                          Live
                        </Box>
                      )}
                      <Typography variant="body2">
                        {liveTranscript || 'Waiting for call to start...'}
                      </Typography>
                    </Paper>
                  </div>

                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Extracted Symptoms
                    </Typography>
                    <Box className="extracted-symptoms-box">
                      {extractedSymptoms.map((symptom, index) => (
                        <Chip
                          key={index}
                          label={symptom.text}
                          color={symptom.severity === 'high' ? 'error' : 
                                symptom.severity === 'medium' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </div>

                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Text-to-Speech
                    </Typography>
                    <Box className="text-to-speech-box">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={startTextToSpeech}
                        disabled={!activeCall}
                      >
                        Start Text-to-Speech
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={stopTextToSpeech}
                        disabled={!activeCall}
                        sx={{ ml: 2 }}
                      >
                        Stop Text-to-Speech
                      </Button>
                    </Box>
                  </div>
                </Box>
              ) : (
                <Typography color="text.secondary">No active call</Typography>
              )}
            </Box>
            <Box className="address-box" ref={addressRef}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <TextField
                label="Address"
                fullWidth
                value={newPatientDetails.address}
                onChange={handleNewPatientDetailsChange('address')}
              />
              {addressWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Please enter the address before dispatching an ambulance.
                </Alert>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitAddress}
                sx={{ mt: 2 }}
                fullWidth
              >
                Submit Address
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={newCallDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Start New Emergency Call</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Patient Name"
            type="text"
            fullWidth
            value={newPatientDetails.name}
            onChange={handleNewPatientDetailsChange('name')}
          />
          <TextField
            margin="dense"
            label="Age"
            type="number"
            fullWidth
            value={newPatientDetails.age}
            onChange={handleNewPatientDetailsChange('age')}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            value={newPatientDetails.phone}
            onChange={handleNewPatientDetailsChange('phone')}
          />
          <TextField
            margin="dense"
            label="Initial Symptoms"
            multiline
            rows={4}
            fullWidth
            value={newPatientDetails.symptoms}
            onChange={handleNewPatientDetailsChange('symptoms')}
          />
          <TextField
            margin="dense"
            label="Address"
            type="text"
            fullWidth
            value={newPatientDetails.address}
            onChange={handleNewPatientDetailsChange('address')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitNewCall} variant="contained" color="primary">
            Start Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallCenterDashboard;
