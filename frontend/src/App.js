import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Container, 
  CssBaseline, 
  Tab, 
  Tabs, 
  ThemeProvider, 
  Toolbar, 
  Typography, 
  createTheme,
  Button
} from '@mui/material';
import { CallEnd as CallEndIcon } from '@mui/icons-material';
import CallCenterDashboard from './components/CallCenterDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import DialerRecords from './components/DialerRecords';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { PatientProvider } from './context/PatientContext';
import './App.css'; // Import the new CSS file

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '10px',
          borderRadius: 8,
        },
      },
    },
  },
});

const HangUpButton = () => {
  const { activeCall, endEmergencyCall, setEmergencyLocation, setAmbulanceLocation, setEditingDetails, setVerifiedDetails, setEditedPatientDetails, setLiveTranscript, setExtractedSymptoms } = useEmergency();

  if (!activeCall) return null;

  return (
    <Box className="hangup-button-container">
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
  );
};

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EmergencyProvider>
        <PatientProvider>
          <Box className="app-container">
            <AppBar position="fixed" className="app-bar">
              <Toolbar className="toolbar">
                <Typography variant="h6" component="div">
                  Emergency Response System
                </Typography>
              </Toolbar>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                centered
                className="modern-tabs"
                sx={{
                  '& .MuiTabs-indicator': {
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
              >
                <Tab label="Call Center" className="modern-tab" />
                <Tab label="Doctor Dashboard" className="modern-tab" />
                <Tab label="Dialer Records" className="modern-tab" />
              </Tabs>
            </AppBar>
            <Container maxWidth="xl" className="container">
              {currentTab === 0 && <CallCenterDashboard />}
              {currentTab === 1 && <DoctorDashboard />}
              {currentTab === 2 && <DialerRecords />}
            </Container>
            <HangUpButton />
          </Box>
        </PatientProvider>
      </EmergencyProvider>
    </ThemeProvider>
  );
}

export default App;