import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { PatientContext } from '../context/PatientContext';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '4px',
  flexGrow: 1
};

// Function to geocode address using Nominatim
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    // Default to Dublin city center if geocoding fails
    return {
      lat: 53.3498,
      lng: -6.2603
    };
  }
};

// Function to fetch real hospital data from OpenStreetMap
const fetchHospitals = async (lat, lng) => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        way["amenity"="hospital"](around:10000,${lat},${lng});
        relation["amenity"="hospital"](around:10000,${lat},${lng});
        node["amenity"="hospital"](around:10000,${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }

    const data = await response.json();
    
    // Process and clean the data
    return data.elements
      .filter(item => (
        (item.lat || item.center?.lat) && 
        (item.lon || item.center?.lon) &&
        item.tags?.name
      ))
      .map(hospital => ({
        id: hospital.id,
        name: hospital.tags.name,
        lat: hospital.lat || hospital.center.lat,
        lng: hospital.lon || hospital.center.lon,
        type: hospital.tags.emergency === 'yes' ? 'Emergency' : 'General',
        address: hospital.tags['addr:street'],
        phone: hospital.tags.phone,
        wheelchair: hospital.tags.wheelchair === 'yes'
      }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
};

// Alias for backward compatibility
const fetchNearbyHospitals = fetchHospitals;

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

const NearbyHospitals = ({ patientDetails }) => {
  const [hospitals, setHospitals] = useState([]);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 53.3498, lng: -6.2603 });
  const [hospitalAssignments, setHospitalAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { patients } = useContext(PatientContext);

  // Fetch hospitals based on patient address
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



  // Effect to handle hospital assignments
  useEffect(() => {
    if (!hospitals.length) return;

    // Sort hospitals by distance and get the nearest 5
    const sortedHospitals = [...hospitals]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearestHospitals(sortedHospitals);

    // Automatically assign patients to nearest hospitals
    if (patients && patients.length > 0) {
      const newAssignments = {};
      patients.forEach(patient => {
        if (!hospitalAssignments[patient.id]) {
          // Find the hospital with the least current assignments
          const hospitalCounts = {};
          Object.values(hospitalAssignments).forEach(hospitalId => {
            hospitalCounts[hospitalId] = (hospitalCounts[hospitalId] || 0) + 1;
          });

          const availableHospitals = sortedHospitals.filter(hospital => 
            (hospitalCounts[hospital.id] || 0) < 5 && // Limit of 5 patients per hospital
            (hospital.type === 'Emergency' || !patient.isEmergency) // Emergency patients go to emergency hospitals
          );

          if (availableHospitals.length > 0) {
            newAssignments[patient.id] = availableHospitals[0].id;
          }
        }
      });

      setHospitalAssignments(prev => ({ ...prev, ...newAssignments }));
    }
  }, [hospitals, selectedLocation, patients, hospitalAssignments]);

  return (
    <Grid container spacing={3} sx={{ height: '80vh' }}>
      <Grid item xs={12} md={8} sx={{ height: '100%' }}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <iframe
            title="Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.05},${selectedLocation.lat - 0.05},${selectedLocation.lng + 0.05},${selectedLocation.lat + 0.05}&layer=mapnik`}
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
            {error && (
              <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            {!error && hospitals.length === 0 && !loading && (
              <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No hospitals found in this area
              </Typography>
            )}
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
                      {hospital.name || 'Unnamed Hospital'}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      ETA: {hospital.estimatedTime} mins
                    </Typography>
                  </Box>
                  {Object.entries(hospitalAssignments)
                    .filter(([_, hId]) => hId === hospital.id)
                    .map(([patientId]) => {
                      const patient = patients.find(p => p.id === patientId);
                      return patient ? (
                        <Box key={patientId} sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          borderRadius: 1,
                          p: 0.5,
                          mb: 0.5
                        }}>
                          <AssignmentIcon sx={{ mr: 1, fontSize: '0.9rem', color: 'primary.main' }} />
                          <Typography variant="body2" color="primary">
                            {patient.name || `Patient ${patientId}`}
                          </Typography>
                        </Box>
                      ) : null;
                    })
                  }
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
