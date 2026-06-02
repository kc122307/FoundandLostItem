import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// A component to handle map clicks
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    },
  });
  return null;
};

const MapView = ({ 
  center = [20.5937, 78.9629], // Default India
  zoom = 5,
  markers = [], 
  selectable = false,
  onLocationSelect,
  selectedLocation = null
}) => {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-300 relative z-0">
      <MapContainer 
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : center} 
        zoom={selectedLocation ? 13 : zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {selectable && <MapEvents onLocationSelect={onLocationSelect} />}

        {/* Render standard markers */}
        {markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            position={[marker.lat, marker.lng]}
          >
            {/* We could add Popups here later */}
          </Marker>
        ))}

        {/* Render selected location if selectable */}
        {selectable && selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
