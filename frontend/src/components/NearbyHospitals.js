import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '4px',
  flexGrow: 1
};

const center = {
  lat: 53.3498, // Dublin city center
  lng: -6.2603,
};

// Mock data for hospitals
const mockHospitals = [
  { id: 1, name: 'St. Vincent\'s Hospital', lat: 53.3328, lng: -6.2274, type: 'General' },
  { id: 2, name: 'Mater Hospital', lat: 53.3589, lng: -6.2662, type: 'Emergency' },
  { id: 3, name: 'Beaumont Hospital', lat: 53.3889, lng: -6.2263, type: 'General' },
  { id: 4, name: 'St. James\'s Hospital', lat: 53.3419, lng: -6.2967, type: 'Emergency' },
  { id: 5, name: 'Tallaght Hospital', lat: 53.2898, lng: -6.3778, type: 'General' },
];

// Function to simulate real-time updates
const simulateMovement = (item) => {
  const latChange = (Math.random() - 0.5) * 0.001; // Small random change in latitude
  const lngChange = (Math.random() - 0.5) * 0.001; // Small random change in longitude
  return {
    ...item,
    lat: item.lat + latChange,
    lng: item.lng + lngChange,
  };
};

const fetchRouteTimeAndDistance = async (startLat, startLng, endLat, endLng) => {
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`);
  const data = await response.json();
  const route = data.routes[0];
  return { time: route.duration, distance: route.distance };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const NearbyHospitals = () => {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(center);

  // Simulate real-time updates for hospitals
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Update hospitals with slight location changes
      setHospitals(prevHospitals =>
        prevHospitals.map(hospital => simulateMovement(hospital))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, []);

  // Update nearest hospitals whenever their locations change
  useEffect(() => {
    if (!hospitals.length) return;

    // Update nearest hospitals
    const sortedHospitals = hospitals
      .map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          hospital.lat,
          hospital.lng
        ),
        estimatedTime: Math.round(calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          hospital.lat,
          hospital.lng
        ) * 2)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearestHospitals(sortedHospitals);
  }, [hospitals, selectedLocation]);

  return (
    <Grid container spacing={3} sx={{ height: '80vh' }}>
      <Grid item xs={12} md={8} sx={{ height: '100%' }}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <iframe
            title="Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05},${center.lat - 0.05},${center.lng + 0.05},${center.lat + 0.05}&layer=mapnik`}
            style={mapContainerStyle}
          ></iframe>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} sx={{ height: '100%' }}>
        <Paper sx={{ 
          p: 2, 
          height: '100%', 
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <Box sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            pt: 2,
            pb: 2,
            zIndex: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospitalIcon sx={{ mr: 1 }} />
              Nearby Hospitals
            </Typography>
          </Box>
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            mt: 1
          }}>
          <List>
            {nearestHospitals.map((hospital) => (
              <ListItem key={hospital.id} sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                mb: 1,
                backgroundColor: hospital.type === 'Emergency' ? '#fff3e0' : '#fff'
              }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {hospital.name}
                    </Typography>
                    <Chip 
                      size="small"
                      label={hospital.type}
                      color={hospital.type === 'Emergency' ? 'warning' : 'default'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospital.distance.toFixed(2)} km away
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      ETA: {hospital.estimatedTime} mins
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}          
          </List>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default NearbyHospitals;
