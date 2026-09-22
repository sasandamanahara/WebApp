import React from 'react';
import {
  Card, CardContent, Typography, Box, Button, Divider, Tooltip
} from '@mui/material';
import {
  LocationOn as GpsIcon,
  Lightbulb as LedIcon,
  DeviceThermostat as TempIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { publishLedCommand } from '../../services/mqttClient';
import useColors from '../../hooks/useColors';

const StatRow = ({ label, value, mono = false, valueColor }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: valueColor || 'text.secondary', fontFamily: mono ? '"Roboto Mono", monospace' : undefined, fontSize: '0.82rem' }}>
      {value}
    </Typography>
  </Box>
);

const DeviceCard = ({ device }) => {
  const C = useColors();
  if (!device) return null;
  const isOnline = device.status === 'online';
  const { temperature, gps, led, lastUpdate } = device;

  const handleLedToggle = (command) => publishLedCommand(device.id, command);

  const getLedChipProps = () => {
    if (led.state === 'ON') return { color: C.green, label: '● ON', bg: `${C.green}12`, border: `${C.green}30` };
    if (led.state === 'OFF') return { color: C.red, label: '○ OFF', bg: `${C.red}10`, border: `${C.red}25` };
    if (led.state === 'COMMAND SENT') return { color: C.amber, label: '◉ SENT', bg: `${C.amber}10`, border: `${C.amber}30` };
    return { color: C.textMuted, label: '— UNKNOWN', bg: `${C.textMuted}10`, border: `${C.textMuted}30` };
  };

  const ledProps = getLedChipProps();
  const nodeColor = device.id === 'ESP01' ? C.esp01 : C.esp02;

  return (
    <Card sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      '&:hover': { transform: 'translateY(-2px)' },
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
      },
    }}>
      <Box sx={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${nodeColor}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: `${nodeColor}18`, border: `1px solid ${nodeColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TempIcon sx={{ color: nodeColor, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>{device.id}</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', letterSpacing: '0.08em' }}>ESP32 NODE</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isOnline ? C.green : C.red, boxShadow: `0 0 8px ${isOnline ? C.green : C.red}` }}
              className={isOnline ? 'pulse-online' : 'pulse-offline'}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: isOnline ? C.green : C.red, fontSize: '0.7rem' }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Typography>
          </Box>
        </Box>

        {/* Primary KPI */}
        <Box sx={{ p: 2, mb: 2.5, borderRadius: '10px', background: `linear-gradient(135deg, ${nodeColor}0d, ${nodeColor}1a)`, border: `1px solid ${nodeColor}25`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Kalman Fused Temperature
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: nodeColor, lineHeight: 1.1, mt: 0.5, textShadow: `0 0 20px ${nodeColor}60` }}>
            {temperature.fused !== null && temperature.fused !== undefined ? `${temperature.fused.toFixed(2)} °C` : '—'}
          </Typography>
        </Box>

        {/* Sensor rows */}
        <Box sx={{ mb: 2 }}>
          <StatRow label="DHT22" value={temperature.dht22 !== null && temperature.dht22 !== undefined ? `${Number(temperature.dht22).toFixed(2)} °C` : '—'} valueColor={C.dht22} />
          <Divider sx={{ borderColor: 'divider' }} />
          <StatRow label="DS18B20" value={temperature.ds18b20 !== null && temperature.ds18b20 !== undefined ? `${Number(temperature.ds18b20).toFixed(2)} °C` : '—'} valueColor={C.ds18b20} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* GPS */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <GpsIcon sx={{ color: 'text.disabled', fontSize: 14, mt: 0.2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>GPS Location</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: '"Roboto Mono", monospace', color: gps.valid ? 'text.secondary' : 'text.disabled', fontSize: '0.78rem', mt: 0.25 }}>
              {gps.valid ? `${gps.latitude.toFixed(6)},  ${gps.longitude.toFixed(6)}` : '⟳  Searching for satellite fix…'}
            </Typography>
          </Box>
        </Box>

        {/* LED */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LedIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>LED</Typography>
            <Box sx={{ px: 1.5, py: 0.25, borderRadius: '20px', background: ledProps.bg, border: `1px solid ${ledProps.border}` }}>
              <Typography variant="caption" sx={{ color: ledProps.color, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>{ledProps.label}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={`Turn ${device.id} LED ON`} arrow>
              <Button size="small" variant="outlined" onClick={() => handleLedToggle('1')} sx={{ minWidth: 42, px: 1.5, py: 0.5, borderColor: `${C.green}60`, color: C.green, '&:hover': { bgcolor: `${C.green}12`, borderColor: C.green }, fontSize: '0.72rem', fontWeight: 700 }}>ON</Button>
            </Tooltip>
            <Tooltip title={`Turn ${device.id} LED OFF`} arrow>
              <Button size="small" variant="outlined" onClick={() => handleLedToggle('0')} sx={{ minWidth: 42, px: 1.5, py: 0.5, borderColor: `${C.red}60`, color: C.red, '&:hover': { bgcolor: `${C.red}12`, borderColor: C.red }, fontSize: '0.72rem', fontWeight: 700 }}>OFF</Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ color: 'text.disabled', fontSize: 12 }} />
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
            {lastUpdate ? `Updated ${formatDistanceToNow(lastUpdate, { addSuffix: true })}` : 'No data received yet'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
