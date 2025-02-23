import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import MAPTILER_API_KEY from '../maps.js'; // Updated import path

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '4px',
};

const center = {
  lat: 53.3498, // Dublin city center
  lng: -6.2603,
};

const fetchNearbyHospitals = async (lat, lng) => {
  const response = await fetch(`https://api.maptiler.com/places/v1/hospitals?key=${MAPTILER_API_KEY}&lat=${lat}&lon=${lng}`);
  const data = await response.json();
  return data.features;
};

const Ambulances = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);

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

  useEffect(() => {
    // Fetch nearby hospitals
    const fetchHospitals = async () => {
      try {
        const hospitalsData = await fetchNearbyHospitals(center.lat, center.lng);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Failed to fetch hospitals', error);
      }
    };

    fetchHospitals();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <iframe
            title="MapTiler Map"
            src={`https://api.maptiler.com/maps/basic-v2/?key=${MAPTILER_API_KEY}#13/${center.lat}/${center.lng}`}
            style={mapContainerStyle}
          ></iframe>
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
          <Typography variant="h6" gutterBottom>
            Nearby Hospitals
          </Typography>
          <List>
            {hospitals.map((hospital) => (
              <ListItem key={hospital.id}>
                <ListItemText
                  primary={hospital.properties.name}
                  secondary={`Location: (${hospital.geometry.coordinates[1]}, ${hospital.geometry.coordinates[0]})`}
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
