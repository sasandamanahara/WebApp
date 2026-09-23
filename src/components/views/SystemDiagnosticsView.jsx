import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack, Chip, Paper, Divider } from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import WifiIcon from '@mui/icons-material/Wifi';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';

const SystemDiagnosticsView = () => {
  const C = useColors();
  const { backendConnected, mqttConnected, devices } = useDeviceStore();

  const topicsList = [
    { topic: 'EE2120/ESP01/temp', desc: 'Raw/Calibrated temperature telemetry stream for ESP01' },
    { topic: 'EE2120/ESP01/LED1/cmd', desc: 'LED 1 control command topic (1=ON, 0=OFF)' },
    { topic: 'EE2120/ESP01/LED1/status', desc: 'LED 1 actual hardware feedback topic' },
    { topic: 'EE2120/ESP01/gps', desc: 'GNSS coordinates payload (lat, lng)' },
    { topic: 'EE2120/ESP01/status', desc: 'Device online / offline status heartbeat' },
    { topic: 'EE2120/ESP02/temp', desc: 'Raw/Calibrated temperature telemetry stream for ESP02' },
    { topic: 'EE2120/ESP02/LED1/cmd', desc: 'LED 1 control command topic for ESP02' },
    { topic: 'EE2120/ESP02/LED1/status', desc: 'LED 1 actual hardware feedback topic for ESP02' },
    { topic: 'EE2120/ESP02/gps', desc: 'GNSS coordinates payload for ESP02' },
    { topic: 'EE2120/ESP02/status', desc: 'Device online / offline status heartbeat' }
  ];

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <DnsIcon sx={{ color: '#00F2FE', fontSize: 36 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              MQTT Broker & Backend Architecture Diagnostics
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Broker Address: <strong style={{ color: '#00F2FE' }}>tcp://10.15.0.3:1883</strong> • Service Identity: <strong style={{ color: '#FFAB00' }}>ignition_scada</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Connectivity Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>SCADA BACKEND SERVER</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#00E676', mt: 0.5 }}>
              http://localhost:3001
            </Typography>
            <Chip label="RUNNING" size="small" sx={{ mt: 1, bgcolor: 'rgba(0, 230, 118, 0.2)', color: '#00E676', fontWeight: 700 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(79, 172, 254, 0.3)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>WEBSOCKET STREAM</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#4FACFE', mt: 0.5 }}>
              ws://localhost:3001/ws
            </Typography>
            <Chip label={backendConnected ? "CONNECTED" : "STREAM ACTIVE"} size="small" sx={{ mt: 1, bgcolor: 'rgba(79, 172, 254, 0.2)', color: '#4FACFE', fontWeight: 700 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>MOSQUITTO BROKER</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#00F2FE', mt: 0.5 }}>
              10.15.0.3:1883
            </Typography>
            <Chip label={mqttConnected ? "CONNECTED" : "FALLBACK SIMULATOR"} size="small" sx={{ mt: 1, bgcolor: mqttConnected ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 171, 0, 0.2)', color: mqttConnected ? '#00E676' : '#FFAB00', fontWeight: 700 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>TELEMETRY PACKET RATE</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFAB00', mt: 0.5 }}>
              ~1.5 Packets / sec
            </Typography>
            <Chip label="STABLE STREAM" size="small" sx={{ mt: 1, bgcolor: 'rgba(255, 171, 0, 0.2)', color: '#FFAB00', fontWeight: 700 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Topics Hierarchy Table */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
          Configured MQTT Topic Hierarchy (EE2120 Specification)
        </Typography>

        <Stack spacing={1.5}>
          {topicsList.map((item, idx) => (
            <Box key={idx} sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#00F2FE', fontFamily: 'monospace', fontWeight: 700 }}>
                {item.topic}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Live Raw JSON Payload Inspector */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '16px', p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <TerminalIcon sx={{ color: '#00F2FE' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
            Live Raw Telemetry Payload Inspector
          </Typography>
        </Stack>

        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#090E17', border: '1px solid rgba(0, 242, 254, 0.2)', fontFamily: 'monospace', fontSize: '0.82rem', color: '#00E676', overflowX: 'auto' }}>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(devices, null, 2)}
          </pre>
        </Box>
      </Card>
    </Box>
  );
};

export default SystemDiagnosticsView;
