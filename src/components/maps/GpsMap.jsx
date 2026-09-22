import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';
import { useTheme } from '@mui/material/styles';
import { Map as MapIcon } from '@mui/icons-material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createColoredIcon = (color) => L.divIcon({
  html: `
    <div style="width:14px;height:14px;background:${color};border:2px solid rgba(255,255,255,0.8);border-radius:50%;box-shadow:0 0 12px ${color},0 0 24px ${color}80;">
      <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:2px;height:8px;background:${color};opacity:0.6;"></div>
    </div>`,
  iconSize: [14, 22],
  iconAnchor: [7, 22],
  popupAnchor: [0, -24],
  className: '',
});

const MapUpdater = ({ devices }) => {
  const map = useMap();
  useEffect(() => {
    const valid = Object.values(devices).filter(d => d.gps.valid);
    if (valid.length === 1) {
      map.setView([valid[0].gps.latitude, valid[0].gps.longitude], map.getZoom(), { animate: true });
    } else if (valid.length > 1) {
      try {
        const bounds = L.latLngBounds(valid.map(d => [d.gps.latitude, d.gps.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      } catch (_) {}
    }
  }, [devices]);
  return null;
};

const GpsMap = () => {
  const C = useColors();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const devices = useDeviceStore(state => state.devices);
  const nodeColors = { ESP01: C.esp01, ESP02: C.esp02 };
  const defaultCenter = [7.2906, 80.6337];

  // OpenStreetMap tile url — can swap for light/dark variants
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <Card sx={{ height: '100%', minHeight: 420, position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: `${C.accent}18`, border: `1px solid ${C.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapIcon sx={{ color: C.accent, fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Distributed Sensor Map</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Real-time GPS node locations</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
            {Object.entries(nodeColors).map(([id, color]) => (
              <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>{id}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Map */}
        <Box sx={{ flexGrow: 1, borderRadius: '10px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%', minHeight: 300 }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url={tileUrl}
            />
            <MapUpdater devices={devices} />
            {Object.values(devices).map(device => {
              if (!device.gps.valid) return null;
              const color = nodeColors[device.id] || C.accent;
              const isOnline = device.status === 'online';
              return (
                <Marker key={device.id} position={[device.gps.latitude, device.gps.longitude]} icon={createColoredIcon(color)}>
                  <Popup>
                    <Box sx={{ minWidth: 160, p: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>{device.id}</Typography>
                        <Typography variant="caption" sx={{ color: isOnline ? C.green : C.red, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                          {isOnline ? '● ONLINE' : '● OFFLINE'}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {device.temperature.fused !== null ? `${device.temperature.fused.toFixed(2)} °C` : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: '"Roboto Mono", monospace', display: 'block', fontSize: '0.72rem' }}>
                        {device.gps.latitude.toFixed(6)},<br />{device.gps.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GpsMap;
