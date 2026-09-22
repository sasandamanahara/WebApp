import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Memory, Wifi, DeviceThermostat, Warning, Cloud } from '@mui/icons-material';
import useDeviceStore from '../../store/deviceStore';
import useAlarmStore from '../../store/alarmStore';
import useMqttStore from '../../store/mqttStore';
import useColors from '../../hooks/useColors';

const KpiCard = ({ title, value, icon, iconColor, accentColor, subtext, subColor }) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      cursor: 'default',
      '&:hover': { transform: 'translateY(-2px)' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
      },
    }}
  >
    <Box sx={{
      position: 'absolute', top: -20, right: -20,
      width: 80, height: 80, borderRadius: '50%',
      background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: '0.65rem', lineHeight: 1 }}>
          {title}
        </Typography>
        <Box sx={{
          p: 0.75, borderRadius: '8px',
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: iconColor,
          display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: subColor || accentColor, boxShadow: `0 0 6px ${subColor || accentColor}` }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>{subtext}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const KpiCards = () => {
  const C = useColors();
  const devices = useDeviceStore(state => state.devices);
  const alarms = useAlarmStore(state => state.alarms);
  const connected = useMqttStore(state => state.connected);

  const deviceList = Object.values(devices);
  const activeNodes = deviceList.length;
  const onlineNodes = deviceList.filter(d => d.status === 'online').length;

  const allTemps = deviceList.map(d => d.temperature?.fused).filter(t => t !== null && t !== undefined && !isNaN(t));
  const avgTemp = allTemps.length > 0 ? (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(2) : '--';
  const maxTemp = allTemps.length > 0 ? Math.max(...allTemps).toFixed(2) : '--';
  const activeAlarmsCount = alarms.filter(a => a.status === 'ACTIVE').length;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4 }}>
      <KpiCard title="ACTIVE NODES" value={activeNodes} icon={<Memory sx={{ fontSize: 18 }} />} iconColor={C.accent} accentColor={C.accent} subtext="Configured nodes" />
      <KpiCard title="ONLINE NODES" value={`${onlineNodes} / ${activeNodes}`} icon={<Wifi sx={{ fontSize: 18 }} />} iconColor={onlineNodes === activeNodes ? C.green : C.amber} accentColor={onlineNodes === activeNodes ? C.green : C.amber} subtext={onlineNodes === activeNodes ? 'All systems nominal' : 'Degraded'} subColor={onlineNodes === activeNodes ? C.green : C.amber} />
      <KpiCard title="AVG TEMPERATURE" value={avgTemp !== '--' ? `${avgTemp} °C` : '--'} icon={<DeviceThermostat sx={{ fontSize: 18 }} />} iconColor={C.accent} accentColor={C.accent} subtext={`Peak: ${maxTemp !== '--' ? maxTemp + ' °C' : '--'}`} />
      <KpiCard title="ACTIVE ALARMS" value={activeAlarmsCount} icon={<Warning sx={{ fontSize: 18 }} />} iconColor={activeAlarmsCount > 0 ? C.red : C.green} accentColor={activeAlarmsCount > 0 ? C.red : C.green} subtext={activeAlarmsCount > 0 ? 'Attention required' : 'All clear'} subColor={activeAlarmsCount > 0 ? C.red : C.green} />
      <KpiCard title="MQTT BROKER" value={connected ? 'LIVE' : 'DOWN'} icon={<Cloud sx={{ fontSize: 18 }} />} iconColor={connected ? C.green : C.red} accentColor={connected ? C.green : C.red} subtext={connected ? 'WebSocket active' : 'No connection'} subColor={connected ? C.green : C.red} />
    </Box>
  );
};

export default KpiCards;
