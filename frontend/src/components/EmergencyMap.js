import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Box, CircularProgress, Typography } from '@mui/material';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
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

function EmergencyMap({ emergencyLocation, ambulanceLocation }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={13}
      center={emergencyLocation || center}
      options={options}
    >
      {emergencyLocation && (
        <Marker
          position={emergencyLocation}
          icon={{
            url: '/emergency-marker.svg',
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />
      )}
      {ambulanceLocation && (
        <Marker
          position={ambulanceLocation}
          icon={{
            url: '/ambulance-marker.svg',
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />
      )}
    </GoogleMap>
  );
}

export default EmergencyMap;
