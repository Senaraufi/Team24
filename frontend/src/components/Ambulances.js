import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '70vh', // Set height to 80vh
  borderRadius: '4px',
};

const center = {
  lat: 53.3498, // Dublin city center
  lng: -6.2603,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const Ambulances = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [ambulances, setAmbulances] = useState([]);

  useEffect(() => {
    // Fetch the list of ambulances from the API
    const fetchAmbulances = async () => {
      try {
        const response = await fetch('/api/ambulances');
        const data = await response.json();
        setAmbulances(data);
      } catch (error) {
        console.error('Failed to fetch ambulances', error);
      }
    };

    fetchAmbulances();
  }, []);

  if (loadError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading maps</Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            options={options}
          >
            {ambulances.map((ambulance) => (
              <Marker
                key={ambulance.id}
                position={{ lat: ambulance.lat, lng: ambulance.lng }}
                icon={{
                  url: '/ambulance-marker.svg',
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            ))}
          </GoogleMap>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Available Ambulances
          </Typography>
          <List>
            {ambulances.map((ambulance) => (
              <ListItem key={ambulance.id}>
                <ListItemText
                  primary={`Ambulance ${ambulance.id}`}
                  secondary={`Location: (${ambulance.lat}, ${ambulance.lng})`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Ambulances;
