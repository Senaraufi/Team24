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

// --- Added severity evaluator code ---
const SYMPTOM_SEVERITY = {
  'chest pain': 5,
  'heart palpitations': 4,
  'shortness of breath': 4,
  'dizziness': 3,
  'severe headache': 4,
  'confusion': 4,
  'seizure': 5,
  'loss of consciousness': 5,
  'stroke symptoms': 5,
  'numbness': 3,
  'difficulty breathing': 5,
  'wheezing': 3,
  'coughing': 2,
  'bleeding': 4,
  'severe bleeding': 5,
  'head injury': 5,
  'broken bone': 4,
  'burn': 4,
  'severe burn': 5,
  'severe abdominal pain': 4,
  'vomiting': 2,
  'vomiting blood': 5,
  'fever': 2,
  'high fever': 4,
  'severe pain': 4,
  'mild pain': 2,
  'allergic reaction': 4,
  'severe allergic reaction': 5,
};

const evaluateSymptoms = (symptoms) => {
  if (!symptoms || symptoms.length === 0) return 0;
  // Map each symptom object's text to a severity score (default to 1 if not recognized)
  const severityScores = symptoms.map(
    (symptom) => SYMPTOM_SEVERITY[symptom.text.toLowerCase()] || 1
  );
  const maxSeverity = Math.max(...severityScores);
  const highSeverityCount = severityScores.filter(score => score >= 4).length;
  const totalSymptoms = symptoms.length;
  let score = maxSeverity;
  if (highSeverityCount > 1) {
    score = Math.min(score + 0.5 * (highSeverityCount - 1), 5);
  }
  if (totalSymptoms > 2) {
    score = Math.min(score + 0.25 * (totalSymptoms - 2), 5);
  }
  return Math.round(score * 100) / 100;
};
// --- End severity evaluator code ---

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
    severityScore, // from context, but we'll override it
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
  // New state for computed severity score
  const [computedSeverity, setComputedSeverity] = useState(severityScore);
  const [transcriptionData, setTranscriptionData] = useState({
    interim: '',
    final: '',
    fullTranscript: []
  });
  const [detectedConditions, setDetectedConditions] = useState({
    injuries: [],
    symptoms: []
  });

  // Update computedSeverity whenever extractedSymptoms changes
  useEffect(() => {
    const newScore = evaluateSymptoms(extractedSymptoms);
    setComputedSeverity(newScore);
  }, [extractedSymptoms]);

  // Simulate live transcription updates
  useEffect(() => {
    if (activeCall) {
      const handleTranscriptionUpdate = (data) => {
        setTranscriptionData(prev => ({
          interim: data.interim,
          final: data.final,
          fullTranscript: data.final ? 
            [...prev.fullTranscript, data.final].slice(-50) : 
            prev.fullTranscript
        }));

        // Update detected conditions if available
        if (data.detected) {
          setDetectedConditions(prev => ({
            injuries: [...new Set([...prev.injuries, ...data.detected.injuries])],
            symptoms: [...new Set([...prev.symptoms, ...data.detected.symptoms])]
          }));
        }
      };

      startLiveTranscription(handleTranscriptionUpdate);
    }
    return () => stopLiveTranscription();
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
          
          // Updated transcription handler
          const handleTranscriptionUpdate = (data) => {
            setTranscriptionData(prev => ({
              interim: data.interim,
              final: data.final,
              // Store just the text string instead of an object
              fullTranscript: data.final ? 
                [...prev.fullTranscript, data.final] : 
                prev.fullTranscript
            }));

            if (data.final) {
              if (data.final.toLowerCase().includes('pain') || 
                  data.final.toLowerCase().includes('difficulty') ||
                  data.final.toLowerCase().includes('problem')) {
                setExtractedSymptoms(prev => [...prev, {
                  text: data.final,
                  severity: 'medium'
                }]);
              }
            }
          };

          startLiveTranscription(handleTranscriptionUpdate);
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
    return () => {
      stopTextToSpeech();
      stopLiveTranscription();
    };
  }, [activeCall]);

  const renderTranscriptionBox = () => (
    <div className="transcription-container">
      <Typography variant="subtitle1" gutterBottom>
        Live Transcription
      </Typography>
      <Paper 
        className="live-transcription-box" 
        sx={{
          p: 2,
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          position: 'relative'
        }}
      >
        {activeCall && (
          <Box 
            className="live-indicator"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span 
              style={{
                width: 8,
                height: 8,
                backgroundColor: '#ff0000',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <Typography variant="caption" color="error">
              LIVE
            </Typography>
          </Box>
        )}
        
        {/* Show interim results */}
        {transcriptionData.interim && (
          <Typography 
            variant="body2" 
            sx={{ color: 'text.secondary', fontStyle: 'italic' }}
          >
            {transcriptionData.interim}
          </Typography>
        )}

        {/* Show full transcript */}
        <Box sx={{ mt: 2 }}>
          {transcriptionData.fullTranscript.map((text, index) => (
            <div key={index} className="transcript-entry">
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  borderLeft: '2px solid #2196f3',
                  pl: 1
                }}
              >
                {text}
              </Typography>
              <div className="key-points-container">
                {text.split('.').map((sentence, i) => {
                  if (sentence.trim().length > 0) {
                    return (
                      <div key={i} className="key-point-bubble">
                        {sentence.trim()}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </Box>
      </Paper>

      {/* Add detected conditions display */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Detected Injuries
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {detectedConditions.injuries.map((injury, index) => (
            <Chip
              key={index}
              label={injury}
              color="error"
              variant="outlined"
            />
          ))}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Detected Symptoms
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {detectedConditions.symptoms.map((symptom, index) => (
            <Chip
              key={index}
              label={symptom}
              color="warning"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    </div>
  );

  const renderEmergencyDetails = () => (
    <Box className="emergency-details-box">
      <Typography variant="h6" gutterBottom>
        Emergency Details
      </Typography>
      {activeCall ? (
        <Box sx={{ '& > *': { mb: 2 } }}>
          {/* Symptoms section */}
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

          {/* Severity Score section */}
          <div>
            <Typography variant="subtitle1" gutterBottom>
              Severity Score
            </Typography>
            <Chip
              label={`${computedSeverity}/10`}
              color={computedSeverity >= 8 ? 'error' : computedSeverity >= 5 ? 'warning' : 'success'}
            />
          </div>

          {/* Live Transcription section */}
          {renderTranscriptionBox()}

          {/* Extracted Symptoms section */}
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
        </Box>
      ) : (
        <Typography color="text.secondary">No active call</Typography>
      )}
    </Box>
  );

  return (
    <Box className="dashboard-container">
      <Box className="header-container">
        <Typography variant="h4">
          Call Center Dashboard
        </Typography>
        <Box>
          {computedSeverity >= 8 && (
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
            {renderEmergencyDetails()}
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
