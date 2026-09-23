import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack, Button, Chip, CircularProgress, Alert } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SpeedIcon from '@mui/icons-material/Speed';
import useDeviceStore from '../../store/deviceStore';
import { sendLedCommand } from '../../services/webSocketClient';
import useColors from '../../hooks/useColors';

const LedControlPanel = () => {
  const C = useColors();
  const { devices } = useDeviceStore();
  const [loadingMap, setLoadingMap] = useState({});

  const handleToggle = async (deviceId, ledNum, currentState) => {
    const key = `${deviceId}_led${ledNum}`;
    const nextCmd = currentState === 'ON' ? 'OFF' : 'ON';

    setLoadingMap(prev => ({ ...prev, [key]: true }));
    try {
      await sendLedCommand(deviceId, ledNum, nextCmd);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setLoadingMap(prev => ({ ...prev, [key]: false }));
      }, 200);
    }
  };

  const handlePulseTest = async (deviceId, ledNum) => {
    await sendLedCommand(deviceId, ledNum, 'ON');
    setTimeout(async () => {
      await sendLedCommand(deviceId, ledNum, 'OFF');
    }, 3000);
  };

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(0, 230, 118, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <ToggleOnIcon sx={{ color: '#00E676', fontSize: 36 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              Bi-Directional LED Controls & Hardware State Feedback
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            SCADA principle: Display actual confirmation feedback returned by ESP32 microcontrollers, separating requested commands from physical actuator status.
          </Typography>
        </CardContent>
      </Card>

      {/* Grid of Nodes (ESP01 & ESP02) */}
      <Grid container spacing={3}>
        {['ESP01', 'ESP02'].map(deviceId => {
          const dev = devices[deviceId];
          return (
            <Grid item xs={12} md={6} key={deviceId}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.85) 0%, rgba(10, 18, 33, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                p: 3
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFF' }}>
                      {deviceId} Actuator Panel
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Topics: EE2120/{deviceId}/LED1/cmd & status
                    </Typography>
                  </Box>

                  <Chip
                    label={dev.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: dev.status === 'online' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                      color: dev.status === 'online' ? '#00E676' : '#FF1744',
                      fontWeight: 700
                    }}
                  />
                </Stack>

                {/* LED 1 Card */}
                <Box sx={{
                  p: 2.5, borderRadius: '14px', mb: 2.5,
                  bgcolor: dev.led1.actual_state === 'ON' ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${dev.led1.actual_state === 'ON' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{
                        width: 42, height: 42, borderRadius: '50%',
                        bgcolor: dev.led1.actual_state === 'ON' ? '#00E676' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: dev.led1.actual_state === 'ON' ? '0 0 16px #00E676' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <LightbulbIcon sx={{ color: dev.led1.actual_state === 'ON' ? '#090E17' : 'rgba(255,255,255,0.4)' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFF' }}>
                          Primary LED 1 (GPIO 2)
                        </Typography>
                        <Typography variant="caption" sx={{ color: dev.led1.actual_state === 'ON' ? '#00E676' : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                          Hardware Feedback: {dev.led1.actual_state}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handlePulseTest(deviceId, 1)}
                        sx={{ textTransform: 'none', color: '#00F2FE', borderColor: 'rgba(0,242,254,0.3)', fontWeight: 700 }}
                      >
                        Pulse 3s
                      </Button>
                      <Button
                        variant="contained"
                        color={dev.led1.actual_state === 'ON' ? 'error' : 'success'}
                        onClick={() => handleToggle(deviceId, 1, dev.led1.actual_state)}
                        disabled={loadingMap[`${deviceId}_led1`]}
                        sx={{ px: 3, fontWeight: 800, textTransform: 'none' }}
                      >
                        {loadingMap[`${deviceId}_led1`] ? <CircularProgress size={20} /> : (dev.led1.actual_state === 'ON' ? 'TURN OFF' : 'TURN ON')}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                {/* LED 2 Card */}
                <Box sx={{
                  p: 2.5, borderRadius: '14px',
                  bgcolor: dev.led2.actual_state === 'ON' ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${dev.led2.actual_state === 'ON' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{
                        width: 42, height: 42, borderRadius: '50%',
                        bgcolor: dev.led2.actual_state === 'ON' ? '#00E676' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: dev.led2.actual_state === 'ON' ? '0 0 16px #00E676' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <LightbulbIcon sx={{ color: dev.led2.actual_state === 'ON' ? '#090E17' : 'rgba(255,255,255,0.4)' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFF' }}>
                          Secondary LED 2 (GPIO 4)
                        </Typography>
                        <Typography variant="caption" sx={{ color: dev.led2.actual_state === 'ON' ? '#00E676' : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                          Hardware Feedback: {dev.led2.actual_state}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handlePulseTest(deviceId, 2)}
                        sx={{ textTransform: 'none', color: '#00F2FE', borderColor: 'rgba(0,242,254,0.3)', fontWeight: 700 }}
                      >
                        Pulse 3s
                      </Button>
                      <Button
                        variant="contained"
                        color={dev.led2.actual_state === 'ON' ? 'error' : 'success'}
                        onClick={() => handleToggle(deviceId, 2, dev.led2.actual_state)}
                        disabled={loadingMap[`${deviceId}_led2`]}
                        sx={{ px: 3, fontWeight: 800, textTransform: 'none' }}
                      >
                        {loadingMap[`${deviceId}_led2`] ? <CircularProgress size={20} /> : (dev.led2.actual_state === 'ON' ? 'TURN OFF' : 'TURN ON')}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LedControlPanel;
