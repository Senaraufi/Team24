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
  createTheme 
} from '@mui/material';
import CallCenterDashboard from './components/CallCenterDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import DialerRecords from './components/DialerRecords';
import { EmergencyProvider } from './context/EmergencyContext';
import { PatientProvider } from './context/PatientContext';

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
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" sx={{ height: 70, borderRadius: 0 }}>
              <Toolbar sx={{ justifyContent: 'center', height: '100%', minHeight: '64px' }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  Emergency Response System
                </Typography>
              </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 5, mb: 4, pt: 2 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                centered
                sx={{ bgcolor: 'primary.dark', mt: 2 }}
              >
                <Tab label="Call Center" />
                <Tab label="Doctor Dashboard" />
                <Tab label="Dialer Records" />
              </Tabs>
              {currentTab === 0 && <CallCenterDashboard />}
              {currentTab === 1 && <DoctorDashboard />}
              {currentTab === 2 && <DialerRecords />}
            </Container>
          </Box>
        </PatientProvider>
      </EmergencyProvider>
    </ThemeProvider>
  );
}

export default App;
