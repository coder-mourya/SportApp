import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const libraries = ['places']; // Add other libraries as needed

const GoogleMapComponent = ({ apiKey, initialCenter, zoomLevel }) => {
  const [map, setMap] = useState(null);

  const handleLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  useEffect(() => {
    // Cleanup function to prevent memory leaks
    return () => setMap(null);
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '400px', // Adjust height as needed
  };

  const center = initialCenter || { lat: 40.7128, lng: -74.0059 }; // Default center coordinates

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      {apiKey && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={zoomLevel || 10}
          center={center}
          onLoad={handleLoad}
        >
          {map && <Marker position={center} />}
        </GoogleMap>
      )}
    </LoadScript>
  );
};

export default GoogleMapComponent;
