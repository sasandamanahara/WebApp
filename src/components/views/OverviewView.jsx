import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Chip, Button, LinearProgress, Divider } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SensorsIcon from '@mui/icons-material/Sensors';
import FunctionsIcon from '@mui/icons-material/Functions';
import SpeedIcon from '@mui/icons-material/Speed';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceStore from '../../store/deviceStore';
import { sendLedCommand } from '../../services/webSocketClient';
import useColors from '../../hooks/useColors';

const OverviewView = () => {
  const C = useColors();
  const { devices, selectedDevice, setActiveView } = useDeviceStore();

  const activeNodes = selectedDevice === 'ALL' 
    ? [devices.ESP01, devices.ESP02]
    : [devices[selectedDevice]];

  const handleLedToggle = async (deviceId, ledNum, currentStatus) => {
    const nextCmd = currentStatus === 'ON' ? 'OFF' : 'ON';
    await sendLedCommand(deviceId, ledNum, nextCmd);
  };

  return (
    <Box>
      {/* Visual Pipeline Story Header */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(13, 22, 41, 0.9) 0%, rgba(8, 14, 26, 0.95) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        boxShadow: '0 0 24px rgba(0, 242, 254, 0.1)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="overline" sx={{ color: '#00F2FE', fontWeight: 800, letterSpacing: '0.12em', fontSize: '0.75rem' }}>
            INTELLIGENT TELEMETRY PIPELINE
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
            Dual-Sensor Calibration & Kalman Fusion Engine
          </Typography>

          {/* Pipeline Flowchart */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <SensorsIcon sx={{ color: '#4FACFE' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>1. Raw Sensors</Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  DHT22 (Humidity/Temp) + DS18B20 (Waterproof 1-Wire)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <SpeedIcon sx={{ color: '#FFAB00' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>2. Linear Calibration</Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  T_cal = m × T_raw + c (Error Corrected)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <FunctionsIcon sx={{ color: '#00F2FE' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>3. Kalman Fusion</Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Weighted Covariance Variance Matrix Optimization
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.4)', boxShadow: '0 0 12px rgba(0, 242, 254, 0.2)' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <ThermostatIcon sx={{ color: '#00E676' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00E676' }}>4. Fused Output</Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                  High-Precision Real-Time Estimate (T_f)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Node Cards Loop */}
      <Grid container spacing={3}>
        {activeNodes.map((dev) => (
          <Grid item xs={12} lg={6} key={dev.deviceId}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.85) 0%, rgba(10, 18, 33, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Card Header */}
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: '8px',
                    bgcolor: dev.deviceId === 'ESP01' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 171, 0, 0.15)',
                    color: dev.deviceId === 'ESP01' ? '#00F2FE' : '#FFAB00',
                    border: `1px solid ${dev.deviceId === 'ESP01' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 171, 0, 0.4)'}`,
                    fontWeight: 800, fontSize: '0.9rem'
                  }}>
                    {dev.deviceId}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                    Sensing Node {dev.deviceId === 'ESP01' ? '1 (Lab Bench A)' : '2 (Field Node B)'}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={dev.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: dev.status === 'online' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                      color: dev.status === 'online' ? '#00E676' : '#FF1744',
                      border: `1px solid ${dev.status === 'online' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 23, 68, 0.3)'}`,
                      fontWeight: 700
                    }}
                  />
                  <Chip
                    label={dev.gps.gps_status}
                    size="small"
                    sx={{ bgcolor: 'rgba(79, 172, 254, 0.15)', color: '#4FACFE', border: '1px solid rgba(79, 172, 254, 0.3)', fontWeight: 700 }}
                  />
                </Stack>
              </Box>

              {/* Card Body */}
              <CardContent sx={{ p: 3 }}>
                {/* Hero Fused Temperature Display */}
                <Box sx={{
                  p: 2.5, borderRadius: '14px', mb: 3,
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(79, 172, 254, 0.03) 100%)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#00F2FE', fontWeight: 800, letterSpacing: '0.1em' }}>
                      KALMAN FUSED TEMPERATURE (T_f)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                        {dev.fused_temperature !== null ? dev.fused_temperature.toFixed(2) : '--.--'}
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#00F2FE', fontWeight: 700 }}>
                        °C
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                      Sensor Difference
                    </Typography>
                    <Chip
                      icon={dev.difference > 1.5 ? <WarningAmberIcon style={{ color: '#FF1744' }} /> : <CheckCircleOutlinedIcon style={{ color: '#00E676' }} />}
                      label={`Δ ${dev.difference.toFixed(2)} °C`}
                      size="small"
                      sx={{
                        mt: 0.5,
                        bgcolor: dev.difference > 1.5 ? 'rgba(255, 23, 68, 0.2)' : 'rgba(0, 230, 118, 0.15)',
                        color: dev.difference > 1.5 ? '#FF1744' : '#00E676',
                        border: `1px solid ${dev.difference > 1.5 ? '#FF1744' : '#00E676'}`,
                        fontWeight: 700
                      }}
                    />
                  </Box>
                </Box>

                {/* Sensor Comparison Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* DHT22 */}
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" sx={{ color: '#4FACFE', fontWeight: 700, display: 'block' }}>
                        DHT22 SENSOR
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Raw:</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>{dev.dht_raw}°C</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Calibrated:</Typography>
                        <Typography variant="body2" sx={{ color: '#00F2FE', fontWeight: 800 }}>{dev.dht_calibrated}°C</Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  {/* DS18B20 */}
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" sx={{ color: '#FFAB00', fontWeight: 700, display: 'block' }}>
                        DS18B20 SENSOR
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Raw:</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>{dev.ds18b20_raw}°C</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Calibrated:</Typography>
                        <Typography variant="body2" sx={{ color: '#FFAB00', fontWeight: 800 }}>{dev.ds18b20_calibrated}°C</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {/* Independent LED Controls Section */}
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, fontSize: '0.7rem' }}>
                    HARDWARE LED CONTROLS & ACTUAL FEEDBACK
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {/* LED 1 */}
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '8px', bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>LED 1</Typography>
                          <Typography variant="caption" sx={{ color: dev.led1.actual_state === 'ON' ? '#00E676' : 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>
                            State: {dev.led1.actual_state}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={dev.led1.actual_state === 'ON' ? 'contained' : 'outlined'}
                          color={dev.led1.actual_state === 'ON' ? 'success' : 'inherit'}
                          onClick={() => handleLedToggle(dev.deviceId, 1, dev.led1.actual_state)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          {dev.led1.actual_state === 'ON' ? 'Turn OFF' : 'Turn ON'}
                        </Button>
                      </Box>
                    </Grid>

                    {/* LED 2 */}
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '8px', bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>LED 2</Typography>
                          <Typography variant="caption" sx={{ color: dev.led2.actual_state === 'ON' ? '#00E676' : 'rgba(255, 255, 255, 0.5)', fontWeight: 700 }}>
                            State: {dev.led2.actual_state}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={dev.led2.actual_state === 'ON' ? 'contained' : 'outlined'}
                          color={dev.led2.actual_state === 'ON' ? 'success' : 'inherit'}
                          onClick={() => handleLedToggle(dev.deviceId, 2, dev.led2.actual_state)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          {dev.led2.actual_state === 'ON' ? 'Turn OFF' : 'Turn ON'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* GPS Footer Bar */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ color: '#4FACFE', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>
                      {dev.gps.latitude.toFixed(4)}°N, {dev.gps.longitude.toFixed(4)}°E ({dev.gps.satellites} Sats)
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setActiveView('fusion')}
                    sx={{ textTransform: 'none', color: '#00F2FE', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    View Math Details
                  </Button>
                </Stack>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewView;
