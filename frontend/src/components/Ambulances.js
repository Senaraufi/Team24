import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PatientContext } from '../context/PatientContext';

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

const NearbyHospitals = ({ patientDetails }) => {
  const [hospitals, setHospitals] = useState([]);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(center);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to update hospitals when patient details change
  useEffect(() => {
    const loadHospitals = async () => {
      if (!patientDetails?.address) {
        console.log('No patient address provided');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hospitals for address:', patientDetails.address);
        const location = await geocodeAddress(patientDetails.address);
        console.log('Geocoded location:', location);
        
        setSelectedLocation(location);
        const data = await fetchHospitals(location.lat, location.lng);
        console.log('Found hospitals:', data.length);
        
        // Calculate real ETAs and distances for each hospital
        const hospitalsWithETA = await Promise.all(data.map(async hospital => {
          try {
            const routeInfo = await fetchRouteTimeAndDistance(
              location.lat,
              location.lng,
              hospital.lat,
              hospital.lng
            );
            
            return {
              ...hospital,
              distance: routeInfo.distance / 1000, // Convert to km
              estimatedTime: Math.round(routeInfo.time / 60) // Convert to minutes
            };
          } catch (error) {
            console.error('Error calculating route:', error);
            // Fallback to straight-line distance if route calculation fails
            const distance = calculateDistance(
              location.lat,
              location.lng,
              hospital.lat,
              hospital.lng
            );
            return {
              ...hospital,
              distance: distance,
              estimatedTime: Math.round(distance * 2) // Rough estimate: 30 km/h average speed
            };
          }
        }));

        console.log('Hospitals with ETAs:', hospitalsWithETA);

        if (hospitalsWithETA.length === 0) {
          setError('No hospitals found in this area');
        } else {
          setHospitals(hospitalsWithETA);
          // Immediately update nearest hospitals
          const sorted = [...hospitalsWithETA]
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
          setNearestHospitals(sorted);
        }
      } catch (err) {
        setError('Failed to load hospital data');
        console.error('Error loading hospitals:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();

    // Refresh data every 5 minutes
    const refreshInterval = setInterval(loadHospitals, 300000);
    return () => clearInterval(refreshInterval);
  }, [patientDetails?.address]); // Only depend on the address


  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <iframe
            title="Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.05},${selectedLocation.lat - 0.05},${selectedLocation.lng + 0.05},${selectedLocation.lat + 0.05}&layer=mapnik`}
            style={mapContainerStyle}
          ></iframe>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%', overflowY: 'auto', maxHeight: '70vh' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalHospitalIcon sx={{ mr: 1 }} />
            Nearby Hospitals
          </Typography>
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
        </Paper>
      </Grid>
    </Grid>
  );
};

const Ambulances = () => {
  const { patients } = useContext(PatientContext);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Select the first patient by default
    if (patients?.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
    }
  }, [patients]); // Only depend on patients

  const handlePatientSelect = (patient) => {
    console.log('Selecting patient:', patient);
    setSelectedPatient(patient);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ambulance Dispatch & Hospital Assignment
      </Typography>
      
      {/* Patient Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Patient
        </Typography>
        <List>
          {patients?.map((patient) => (
            <ListItem 
              key={patient.id} 
              button 
              selected={selectedPatient?.id === patient.id}
              onClick={() => handlePatientSelect(patient)}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                backgroundColor: patient.isEmergency ? '#fff3e0' : '#fff',
                '&:hover': {
                  backgroundColor: patient.isEmergency ? '#ffe0b2' : '#f5f5f5',
                },
                '&.Mui-selected': {
                  backgroundColor: patient.isEmergency ? '#ffb74d' : '#e0e0e0',
                  '&:hover': {
                    backgroundColor: patient.isEmergency ? '#ffa726' : '#bdbdbd',
                  }
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.address}
                </Typography>
                {patient.isEmergency && (
                  <Chip 
                    size="small" 
                    label="Emergency" 
                    color="warning" 
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Nearby Hospitals */}
      {selectedPatient ? (
        <Box sx={{ mb: 2 }}>
          <NearbyHospitals 
            key={selectedPatient.id} 
            patientDetails={selectedPatient} 
          />
        </Box>
      ) : (
        <Typography color="text.secondary" align="center">
          Select a patient to view nearby hospitals
        </Typography>
      )}
    </Box>
  );
};

export default Ambulances;
