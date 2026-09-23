import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack, Button, Chip } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icons with HTML/CSS DivIcon for clean custom styling
const createNodeIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-gps-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid #090E17;
        box-shadow: 0 0 16px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #090E17;
        font-weight: 900;
        font-size: 11px;
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const iconESP01 = createNodeIcon('#00F2FE', '01');
const iconESP02 = createNodeIcon('#FFAB00', '02');

// Map Recenter Helper Component
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const GpsMap = () => {
  const C = useColors();
  const { devices, selectedDevice } = useDeviceStore();

  const esp01Gps = devices.ESP01.gps;
  const esp02Gps = devices.ESP02.gps;

  const defaultCenter = [7.2550, 80.5924]; // University of Peradeniya Faculty of Engineering
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const posESP01 = [esp01Gps.latitude || 7.2543, esp01Gps.longitude || 80.5916];
  const posESP02 = [esp02Gps.latitude || 7.2558, esp02Gps.longitude || 80.5932];

  // Calculate Haversine Distance in meters between ESP01 and ESP02
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceMeters = calcDistance(posESP01[0], posESP01[1], posESP02[0], posESP02[1]);

  return (
    <Box>
      {/* Header Controls */}
      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.85) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(79, 172, 254, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                Geospatial GNSS Tracking & Node Positioning
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Inter-Node Separation: <strong style={{ color: '#00F2FE' }}>{distanceMeters} meters</strong> • Peradeniya Campus Network
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MyLocationIcon style={{ color: '#00F2FE' }} />}
                onClick={() => setMapCenter(posESP01)}
                sx={{ borderColor: 'rgba(0, 242, 254, 0.4)', color: '#00F2FE', textTransform: 'none', fontWeight: 700 }}
              >
                LOCATE ESP01
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MyLocationIcon style={{ color: '#FFAB00' }} />}
                onClick={() => setMapCenter(posESP02)}
                sx={{ borderColor: 'rgba(255, 171, 0, 0.4)', color: '#FFAB00', textTransform: 'none', fontWeight: 700 }}
              >
                LOCATE ESP02
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Node Metadata Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* ESP01 Metadata */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00F2FE' }}>ESP01 GPS NODE</Typography>
              <Chip label={esp01Gps.gps_status} size="small" sx={{ bgcolor: 'rgba(0, 242, 254, 0.2)', color: '#00F2FE', fontWeight: 700 }} />
            </Stack>

            <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 700, mt: 1, fontFamily: 'monospace' }}>
              Lat: {posESP01[0].toFixed(5)}° N | Lng: {posESP01[1].toFixed(5)}° E
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Satellites: {esp01Gps.satellites} | Fix Quality: High
            </Typography>
          </Box>
        </Grid>

        {/* ESP02 Metadata */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(255, 171, 0, 0.08)', border: '1px solid rgba(255, 171, 0, 0.25)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFAB00' }}>ESP02 GPS NODE</Typography>
              <Chip label={esp02Gps.gps_status} size="small" sx={{ bgcolor: 'rgba(255, 171, 0, 0.2)', color: '#FFAB00', fontWeight: 700 }} />
            </Stack>

            <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 700, mt: 1, fontFamily: 'monospace' }}>
              Lat: {posESP02[0].toFixed(5)}° N | Lng: {posESP02[1].toFixed(5)}° E
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Satellites: {esp02Gps.satellites} | Fix Quality: High
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Leaflet Interactive Map Container */}
      <Card sx={{
        height: 480,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <MapContainer center={defaultCenter} zoom={15} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenter center={mapCenter} />

          {/* Polyline connecting dual nodes */}
          <Polyline positions={[posESP01, posESP02]} color="#00F2FE" dashArray="8, 8" weight={2} />

          {/* ESP01 Marker */}
          <Marker position={posESP01} icon={iconESP01}>
            <Popup>
              <div style={{ color: '#090E17', fontWeight: 700 }}>
                <strong>ESP01 Node (Lab Bench A)</strong><br />
                Temp: {devices.ESP01.fused_temperature}°C<br />
                Sats: {esp01Gps.satellites}
              </div>
            </Popup>
          </Marker>

          {/* ESP02 Marker */}
          <Marker position={posESP02} icon={iconESP02}>
            <Popup>
              <div style={{ color: '#090E17', fontWeight: 700 }}>
                <strong>ESP02 Node (Field Node B)</strong><br />
                Temp: {devices.ESP02.fused_temperature}°C<br />
                Sats: {esp02Gps.satellites}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </Card>
    </Box>
  );
};

export default GpsMap;
