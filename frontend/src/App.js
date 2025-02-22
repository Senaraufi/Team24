import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CallCenterDashboard from './components/CallCenterDashboard';
import DoctorDashboard from './components/DoctorDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Emergency Response Platform
            </Typography>
            <Button color="inherit" component={Link} to="/call-center">
              Call Center
            </Button>
            <Button color="inherit" component={Link} to="/doctor">
              Doctor Dashboard
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/call-center" element={<CallCenterDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/" element={<CallCenterDashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
