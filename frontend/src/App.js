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
import { EmergencyProvider } from './context/EmergencyContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
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
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Emergency Response System
              </Typography>
            </Toolbar>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              centered
              sx={{ bgcolor: 'primary.dark' }}
            >
              <Tab label="Call Center" />
              <Tab label="Doctor Dashboard" />
            </Tabs>
          </AppBar>
          <Container maxWidth="xl" sx={{ mt: 12, mb: 4, pt: 2 }}>
            {currentTab === 0 ? <CallCenterDashboard /> : <DoctorDashboard />}
          </Container>
        </Box>
      </EmergencyProvider>
    </ThemeProvider>
  );
}

export default App;
