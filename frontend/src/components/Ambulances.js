import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

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
    // Fetch nearby hospitals and calculate route times and distances
    const fetchHospitals = async () => {
      try {
        const hospitalsData = await fetchNearbyHospitals(center.lat, center.lng);
        const hospitalsWithTimeAndDistance = await Promise.all(hospitalsData.map(async (hospital) => {
          const { time, distance } = await fetchRouteTimeAndDistance(center.lat, center.lng, hospital.lat, hospital.lon);
          return { ...hospital, time, distance };
        }));
        hospitalsWithTimeAndDistance.sort((a, b) => a.time - b.time);
        setHospitals(hospitalsWithTimeAndDistance);
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
            title="Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05},${center.lat - 0.05},${center.lng + 0.05},${center.lat + 0.05}&layer=mapnik`}
            style={mapContainerStyle}
          ></iframe>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%', overflowY: 'auto', maxHeight: '70vh' }}>
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
                  primary={hospital.tags.name || 'Unnamed Hospital'}
                  secondary={`Distance: ${(hospital.distance / 1000).toFixed(2)} km - Time: ${Math.round(hospital.time / 60)} mins`}
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
