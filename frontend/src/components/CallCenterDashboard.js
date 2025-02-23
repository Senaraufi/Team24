import React, { useState, useEffect, useContext } from 'react';
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
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Check as CheckIcon, 
  Warning as WarningIcon, 
  CallEnd as CallEndIcon,
  ErrorOutline as ErrorOutlineIcon,
  Info as InfoIcon,
  ReportProblem as ReportProblemIcon
} from '@mui/icons-material';
import { useEmergency } from '../context/EmergencyContext';
import { findNearestAmbulance, dispatchAmbulance } from '../services/api';
import EmergencyMap from './EmergencyMap';
import { PatientContext } from '../context/PatientContext';
import { savePatientData } from '../utils/api';

const CallCenterDashboard = () => {
  const [newCallDialogOpen, setNewCallDialogOpen] = useState(false);
  const [newPatientDetails, setNewPatientDetails] = useState({
    name: '',
    age: '',
    phone: '',
    symptoms: ''
  });
  const {
    activeCall,
    transcript,
    patientDetails,
    symptoms,
    severityScore, // Remove default value
    severityDescription,
    dispatchInfo,
    startEmergencyCall,
    updatePatientDetails,
    dispatchAmbulanceToLocation,
    endEmergencyCall,
  } = useEmergency();

  const { addPatient } = useContext(PatientContext);

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
      address: '123 Main St',
    };
    addPatient(newCall);
    try {
      await savePatientData(newCall);
    } catch (error) {
      console.error('Failed to save patient data', error);
    }
  };

  const handleDispatchAmbulance = async () => {
    console.log('Handling ambulance dispatch...');
    if (!activeCall) {
      console.error('No active call to dispatch ambulance for');
      return;
    }

    if (!emergencyLocation) {
      console.error('No emergency location set');
      return;
    }

    try {
      const dispatchResult = await dispatchAmbulanceToLocation(emergencyLocation);
      
      if (dispatchResult) {
        console.log('Ambulance dispatched successfully:', dispatchResult);
        setAmbulanceLocation(dispatchResult.current_location);
      } else {
        console.error('Failed to dispatch ambulance');
      }
    } catch (error) {
      console.error('Error in handleDispatchAmbulance:', error);
    }
  };

  const handleEndCall = () => {
    endEmergencyCall();
    setEmergencyLocation(null);
    setAmbulanceLocation(null);
    setLiveTranscript('');
    setExtractedSymptoms([]);
  };

  // Function to get severity color based on score
  const getSeverityColor = (score) => {
    if (score >= 4.5) return '#ff1744'; // Critical - Red
    if (score >= 3.5) return '#ff9100'; // Severe - Orange
    if (score >= 2.5) return '#ffeb3b'; // Moderate - Yellow
    return '#4caf50'; // Minor/Low - Green
  };

  // Function to get severity icon
  const getSeverityIcon = (score) => {
    if (score >= 4.5) return <ErrorOutlineIcon />;
    if (score >= 3.5) return <ReportProblemIcon />;
    if (score >= 2.5) return <WarningIcon />;
    return <InfoIcon />;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Call Center Dashboard
        </Typography>
        <Box>
          {severityScore !== null && severityScore >= 4.5 && (
            <Chip
              icon={<WarningIcon />}
              label="CRITICAL EMERGENCY"
              color="error"
              sx={{ mr: 2 }}
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
          {activeCall && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEndCall}
              sx={{ ml: 2 }}
            >
              End Call
            </Button>
          )}
        </Box>
      </Box>
      
      {activeCall && severityScore !== null && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: getSeverityColor(severityScore),
            color: severityScore >= 2.5 ? 'white' : 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getSeverityIcon(severityScore)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              Severity Level: {severityScore.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="body1">
            {severityDescription || 'Evaluating...'}
          </Typography>
        </Paper>
      )}

      {activeCall && symptoms?.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Reported Symptoms:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {symptoms.map((symptom, index) => (
              <Chip
                key={index}
                label={symptom}
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: getSeverityColor(severityScore),
                  color: getSeverityColor(severityScore)
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Patient Details
              </Typography>
              {patientDetails && !editingDetails && (
                <IconButton onClick={handleEditDetails} size="small">
                  {verifiedDetails ? <CheckIcon color="success" /> : <EditIcon />}
                </IconButton>
              )}
            </Box>
            {patientDetails ? (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Name" 
                    secondary={patientDetails.name}
                    secondaryTypographyProps={{
                      color: verifiedDetails ? 'success.main' : 'text.secondary'
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Age" 
                    secondary={patientDetails.age}
                    secondaryTypographyProps={{
                      color: verifiedDetails ? 'success.main' : 'text.secondary'
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Location" 
                    secondary={patientDetails.location}
                    secondaryTypographyProps={{
                      color: verifiedDetails ? 'success.main' : 'text.secondary'
                    }}
                  />
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

                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Live Transcription
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: 'grey.50',
                      position: 'relative'
                    }}
                  >
                    {activeCall && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      >
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
          </Paper>
        </Grid>
      </Grid>

      {/* Hang Up Button */}
      {activeCall && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={async () => {
              try {
                const result = await endEmergencyCall();
                if (result) {
                  console.log('Call ended successfully');
                  setEmergencyLocation(null);
                  setAmbulanceLocation(null);
                  setEditingDetails(false);
                  setVerifiedDetails(false);
                  setEditedPatientDetails({});
                  setLiveTranscript('');
                  setExtractedSymptoms([]);
                } else {
                  console.error('Failed to end call');
                }
              } catch (error) {
                console.error('Error ending call:', error);
              }
            }}
            startIcon={<CallEndIcon />}
          >
            Hang Up
          </Button>
        </Box>
      )}

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
