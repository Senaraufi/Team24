<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, Chip, TextField, Button } from '@mui/material';
=======
import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, Chip } from '@mui/material';
>>>>>>> e811ddc107aea6dd26effb99f368195916ededf2
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { PatientContext } from '../context/PatientContext';

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '4px',
  border: '1px solid #e0e0e0'
};

<<<<<<< HEAD
const fetchCoordinates = async (location) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  throw new Error('Location not found');
=======
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
>>>>>>> e811ddc107aea6dd26effb99f368195916ededf2
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
<<<<<<< HEAD
  const [locationInput, setLocationInput] = useState('Dublin');
=======
  const [hospitalAssignments, setHospitalAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { patients } = useContext(PatientContext);
>>>>>>> e811ddc107aea6dd26effb99f368195916ededf2

  // Fetch hospitals based on patient address
  // Effect to update hospitals when patient details change
  useEffect(() => {
<<<<<<< HEAD
    const fetchHospitals = async (lat, lng) => {
      try {
        const hospitalsData = await fetchNearbyHospitals(lat, lng);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Failed to fetch hospitals', error);
      }
    };

    fetchHospitals(selectedLocation.lat, selectedLocation.lng);
  }, [selectedLocation]);
=======
    let isSubscribed = true; // For cleanup

    const loadHospitals = async () => {
      if (!patientDetails?.address) {
        console.log('No patient address provided');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hospitals for address:', patientDetails.address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(patientDetails.address)}&limit=1`);
        const data = await response.json();
        
        if (!data || data.length === 0) throw new Error('Address not found');
        
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        
        console.log('Geocoded location:', location);
        
        if (!isSubscribed) return;
        setSelectedLocation(location);
        
        // Fetch hospitals
        const query = `
          [out:json][timeout:25];
          (
            way["amenity"="hospital"](around:10000,${location.lat},${location.lng});
            relation["amenity"="hospital"](around:10000,${location.lat},${location.lng});
            node["amenity"="hospital"](around:10000,${location.lat},${location.lng});
          );
          out body;
          >;
          out skel qt;
        `;

        const hospitalResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });

        if (!hospitalResponse.ok) throw new Error('Failed to fetch hospitals');

        const hospitalData = await hospitalResponse.json();
        
        if (!isSubscribed) return;
        
        // Process hospital data
        const hospitals = hospitalData.elements
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

        console.log('Found hospitals:', hospitals.length);
        
        if (!isSubscribed) return;
        
        // Calculate real ETAs and distances
        const hospitalsWithETA = await Promise.all(hospitals.map(async hospital => {
          try {
            const routeResponse = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${hospital.lng},${hospital.lat}?overview=false`
            );
            const routeData = await routeResponse.json();
            const route = routeData.routes[0];
            
            return {
              ...hospital,
              distance: route.distance / 1000, // Convert to km
              estimatedTime: Math.round(route.duration / 60) // Convert to minutes
            };
          } catch (error) {
            console.error('Error calculating route:', error);
            // Fallback to straight-line distance
            const R = 6371; // Earth's radius in km
            const dLat = (hospital.lat - location.lat) * Math.PI / 180;
            const dLon = (hospital.lng - location.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(location.lat * Math.PI / 180) * Math.cos(hospital.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            return {
              ...hospital,
              distance: distance,
              estimatedTime: Math.round(distance * 2) // Rough estimate: 30 km/h average speed
            };
          }
        }));

        if (!isSubscribed) return;
        console.log('Hospitals with ETAs:', hospitalsWithETA);

        if (hospitalsWithETA.length === 0) {
          setError('No hospitals found in this area');
        } else {
          // Sort by distance and update state
          const sorted = [...hospitalsWithETA].sort((a, b) => a.distance - b.distance);
          setHospitals(sorted);
          setNearestHospitals(sorted.slice(0, 5));
        }
      } catch (err) {
        if (!isSubscribed) return;
        setError('Failed to load hospital data');
        console.error('Error loading hospitals:', err);
      } finally {
        if (!isSubscribed) return;
        setLoading(false);
      }
    };

    loadHospitals();
>>>>>>> e811ddc107aea6dd26effb99f368195916ededf2

    // Refresh data every 5 minutes
    const refreshInterval = setInterval(loadHospitals, 300000);
    
    // Cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(refreshInterval);
    };
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
  }, [hospitals, patients]); // Only depend on hospitals and patients

  const handleLocationSubmit = async () => {
    try {
      const coordinates = await fetchCoordinates(locationInput);
      setSelectedLocation(coordinates);
    } catch (error) {
      console.error('Failed to fetch coordinates', error);
    }
  };

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
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                label="Location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleLocationSubmit}
                sx={{ ml: 2 }}
              >
                Search
              </Button>
            </Box>
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
