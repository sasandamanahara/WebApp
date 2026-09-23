import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Slider, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Stack, Paper } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useAlarmStore from '../../store/alarmStore';
import { acknowledgeAlarm } from '../../services/webSocketClient';
import useColors from '../../hooks/useColors';

const AlarmsView = () => {
  const C = useColors();
  const { alarms, highTempThreshold, setHighTempThreshold, mismatchThreshold, setMismatchThreshold, ackAlarm } = useAlarmStore();

  const handleAck = async (id) => {
    ackAlarm(id);
    await acknowledgeAlarm(id);
  };

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(255, 23, 68, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <NotificationsActiveIcon sx={{ color: '#FF1744', fontSize: 36 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              SCADA Alarm Management & Event Threshold Configurator
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Real-time automated threshold monitoring for high temperature alerts, sensor mismatch, sensor failures, and offline events.
          </Typography>
        </CardContent>
      </Card>

      {/* Threshold Configurator Panel */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* High Temp Threshold Slider */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 23, 68, 0.3)', borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF1744', mb: 1 }}>
              High Temperature Alarm Setpoint
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Triggers HIGH priority alarm when Fused Temp (T_f) exceeds this limit.
            </Typography>

            <Box sx={{ px: 2 }}>
              <Slider
                value={highTempThreshold}
                min={20}
                max={45}
                step={0.5}
                valueLabelDisplay="on"
                onChange={(e, val) => setHighTempThreshold(val)}
                sx={{ color: '#FF1744' }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Min: 20.0 °C</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FF1744' }}>Setpoint: {highTempThreshold} °C</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Max: 45.0 °C</Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Mismatch Threshold Slider */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFAB00', mb: 1 }}>
              Sensor Mismatch Threshold Setpoint
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Triggers SENSOR MISMATCH warning when |T_dht_cal - T_ds18_cal| exceeds limit.
            </Typography>

            <Box sx={{ px: 2 }}>
              <Slider
                value={mismatchThreshold}
                min={0.2}
                max={4.0}
                step={0.1}
                valueLabelDisplay="on"
                onChange={(e, val) => setMismatchThreshold(val)}
                sx={{ color: '#FFAB00' }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Min: 0.2 °C</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFAB00' }}>Setpoint: {mismatchThreshold} °C</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Max: 4.0 °C</Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Alarms Status Table */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
          Active & Historical Alarm Log
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Device</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Alarm Type</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Severity</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Message</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Status / Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alarms.map(alarm => (
              <TableRow key={alarm.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell sx={{ color: '#FFF', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {new Date(alarm.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <Chip label={alarm.deviceId} size="small" sx={{ bgcolor: 'rgba(0, 242, 254, 0.15)', color: '#00F2FE', fontWeight: 700 }} />
                </TableCell>
                <TableCell sx={{ color: '#FFF', fontWeight: 700 }}>{alarm.type}</TableCell>
                <TableCell>
                  <Chip
                    label={alarm.severity}
                    size="small"
                    sx={{
                      bgcolor: alarm.severity === 'HIGH' ? 'rgba(255, 23, 68, 0.2)' : (alarm.severity === 'MEDIUM' ? 'rgba(255, 171, 0, 0.2)' : 'rgba(79, 172, 254, 0.2)'),
                      color: alarm.severity === 'HIGH' ? '#FF1744' : (alarm.severity === 'MEDIUM' ? '#FFAB00' : '#4FACFE'),
                      fontWeight: 800
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
                  {alarm.message}
                </TableCell>
                <TableCell>
                  {alarm.acknowledged ? (
                    <Chip icon={<CheckCircleIcon style={{ color: '#00E676' }} />} label="ACKNOWLEDGED" size="small" sx={{ bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00E676' }} />
                  ) : (
                    <Button variant="contained" size="small" color="error" onClick={() => handleAck(alarm.id)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Acknowledge
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default AlarmsView;
