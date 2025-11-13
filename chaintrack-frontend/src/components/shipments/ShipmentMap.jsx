import React from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { config } from '@config/config';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const ShipmentMap = ({ shipment }) => {
  const checkpoints = shipment.checkpoints || [];

  // Extract coordinates
  const coordinates = checkpoints.map((cp) => ({
    lat: cp.location.coordinates.latitude / 1000000,
    lng: cp.location.coordinates.longitude / 1000000,
  }));

  // Center map on last checkpoint or default
  const center =
    coordinates.length > 0
      ? coordinates[coordinates.length - 1]
      : { lat: 24.8607, lng: 67.0011 }; // Default: Karachi

  return (
    <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <LoadScript googleMapsApiKey={config.googleMapsApiKey}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
          {/* Markers for each checkpoint */}
          {coordinates.map((coord, index) => (
            <Marker
              key={index}
              position={coord}
              label={(index + 1).toString()}
              title={checkpoints[index]?.location.name}
            />
          ))}

          {/* Polyline connecting checkpoints */}
          {coordinates.length > 1 && (
            <Polyline
              path={coordinates}
              options={{
                strokeColor: '#0ea5e9',
                strokeOpacity: 0.8,
                strokeWeight: 3,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default ShipmentMap;