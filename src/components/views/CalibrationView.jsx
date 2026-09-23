import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, Stack, Paper, Alert } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useDeviceStore from '../../store/deviceStore';
import { updateCalibration } from '../../services/webSocketClient';
import useColors from '../../hooks/useColors';

const CalibrationView = () => {
  const C = useColors();
  const { devices, selectedDevice } = useDeviceStore();

  const devId = selectedDevice === 'ESP02' ? 'ESP02' : 'ESP01';
  const dev = devices[devId];
  const cal = dev.calibration;

  const [dhtSlope, setDhtSlope] = useState(cal.dht_slope);
  const [dhtOffset, setDhtOffset] = useState(cal.dht_offset);
  const [ds18Slope, setDs18Slope] = useState(cal.ds18_slope);
  const [ds18Offset, setDs18Offset] = useState(cal.ds18_offset);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = async () => {
    await updateCalibration(devId, {
      dht_slope: parseFloat(dhtSlope),
      dht_offset: parseFloat(dhtOffset),
      ds18_slope: parseFloat(ds18Slope),
      ds18_offset: parseFloat(ds18Offset)
    });
    setSavedMsg('Calibration parameters updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const refPoints = Array.from({ length: 10 }, (_, i) => {
    const refT = 20 + i * 2;
    return {
      reference: refT,
      dht_raw: refT - 0.4,
      dht_cal: Number((refT * dhtSlope + dhtOffset).toFixed(2)),
      ds18_raw: refT + 0.3,
      ds18_cal: Number((refT * ds18Slope + ds18Offset).toFixed(2))
    };
  });

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(255, 171, 0, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <TuneIcon sx={{ color: '#FFAB00', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              Sensor Calibration Matrix & Regression Curves ({devId})
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Linear regression calibration equations: T_calibrated = m × T_raw + c
          </Typography>
        </CardContent>
      </Card>

      {savedMsg && <Alert severity="success" sx={{ mb: 3 }}>{savedMsg}</Alert>}

      {/* Editable Equations & Sliders */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* DHT22 Calibration */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(79, 172, 254, 0.3)', borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#4FACFE', mb: 2 }}>
              DHT22 Temperature Calibration Equation
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontFamily: 'monospace' }}>
              T_cal = {dhtSlope} × T_raw + ({dhtOffset})
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Slope (m)"
                  type="number"
                  value={dhtSlope}
                  onChange={(e) => setDhtSlope(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Offset (c) °C"
                  type="number"
                  value={dhtOffset}
                  onChange={(e) => setDhtOffset(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* DS18B20 Calibration */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFAB00', mb: 2 }}>
              DS18B20 Temperature Calibration Equation
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontFamily: 'monospace' }}>
              T_cal = {ds18Slope} × T_raw + ({ds18Offset})
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Slope (m)"
                  type="number"
                  value={ds18Slope}
                  onChange={(e) => setDs18Slope(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Offset (c) °C"
                  type="number"
                  value={ds18Offset}
                  onChange={(e) => setDs18Offset(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} sx={{ px: 4, py: 1, fontWeight: 700 }}>
          Save Calibration Matrix
        </Button>
      </Box>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>MEAN ABSOLUTE ERROR (MAE)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#00F2FE', mt: 0.5 }}>{cal.mae} °C</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>ROOT MEAN SQUARE ERROR (RMSE)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4FACFE', mt: 0.5 }}>{cal.rmse} °C</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>STANDARD DEVIATION (σ)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#00E676', mt: 0.5 }}>{cal.std_dev} °C</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Calibration Graph */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
          Reference Temperature vs Calibrated Sensor Output
        </Typography>

        <Box sx={{ width: '100%', height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="reference" name="Reference Temp" unit="°C" stroke="rgba(255,255,255,0.5)" />
              <YAxis type="number" dataKey="dht_cal" name="Calibrated Temp" unit="°C" stroke="rgba(255,255,255,0.5)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#090E17', color: '#FFF' }} />
              <Legend />
              <Scatter name="DHT22 Calibrated" data={refPoints} fill="#4FACFE" line />
              <Scatter name="DS18B20 Calibrated" data={refPoints} fill="#FFAB00" line />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default CalibrationView;
