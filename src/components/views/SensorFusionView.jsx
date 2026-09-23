import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack, Divider, Chip, Paper } from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';

const SensorFusionView = () => {
  const C = useColors();
  const { devices, selectedDevice } = useDeviceStore();

  const devId = selectedDevice === 'ESP02' ? 'ESP02' : 'ESP01';
  const dev = devices[devId];
  const kalman = dev.kalman_details;

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 0 24px rgba(0, 242, 254, 0.12)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <FunctionsIcon sx={{ color: '#00F2FE', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              Kalman Filter & Sensor Fusion Details ({devId})
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Mathematical optimal state estimation fusing DHT22 and DS18B20 calibrated temperature measurements.
          </Typography>
        </CardContent>
      </Card>

      {/* Visual Pipeline Block Diagram */}
      <Card sx={{
        mb: 4,
        background: 'rgba(13, 20, 36, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        p: 3
      }}>
        <Typography variant="overline" sx={{ color: '#00F2FE', fontWeight: 800, letterSpacing: '0.1em' }}>
          LIVE SENSOR FUSION PIPELINE MATRIX
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          {/* Node Inputs */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.3)', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: '#4FACFE', fontWeight: 700 }}>DHT22 Calibrated (z₁)</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFF' }}>{dev.dht_calibrated}°C</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Var σ²₁ = {kalman.var_dht}</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: '#FFAB00', fontWeight: 700 }}>DS18B20 Calibrated (z₂)</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFF' }}>{dev.ds18b20_calibrated}°C</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Var σ²₂ = {kalman.var_ds18}</Typography>
              </Paper>
            </Stack>
          </Grid>

          {/* Fusion Engine Core */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: 3,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(79, 172, 254, 0.05) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)'
            }}>
              <CalculateIcon sx={{ color: '#00F2FE', fontSize: 36, mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                Kalman Gain & Weight Optimization
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 2 }}>
                K_dht = σ²₂ / (σ²₁ + σ²₂) = {kalman.k_dht} &nbsp;|&nbsp; K_ds18 = σ²₁ / (σ²₁ + σ²₂) = {kalman.k_ds18}
              </Typography>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(0, 242, 254, 0.2)' }} />

              <Typography variant="body2" sx={{ color: '#00F2FE', fontFamily: 'monospace', fontWeight: 700 }}>
                T_f = (K_dht × T_dht,cal) + (K_ds18 × T_ds18,cal)
              </Typography>
            </Box>
          </Grid>

          {/* Output Fused Temp */}
          <Grid item xs={12} md={3}>
            <Box sx={{
              p: 3,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.15) 0%, rgba(0, 230, 118, 0.05) 100%)',
              border: '1px solid rgba(0, 230, 118, 0.4)',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(0, 230, 118, 0.2)'
            }}>
              <Typography variant="overline" sx={{ color: '#00E676', fontWeight: 800 }}>FUSED ESTIMATE (T_f)</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 1 }}>
                {dev.fused_temperature.toFixed(2)} °C
              </Typography>
              <Chip label="OPTIMAL COVARIANCE" size="small" sx={{ mt: 1.5, bgcolor: 'rgba(0, 230, 118, 0.2)', color: '#00E676', fontWeight: 700 }} />
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Kalman Matrix Metrics Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Previous Estimate (x_k-1)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFF', mt: 0.5 }}>{kalman.previous_estimate} °C</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Predicted Estimate (x̂_k)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#4FACFE', mt: 0.5 }}>{kalman.predicted_estimate} °C</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Process Noise Covariance (Q)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFAB00', mt: 0.5 }}>{kalman.process_noise}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Error Covariance (P_k)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#00E676', mt: 0.5 }}>{kalman.error_covariance}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SensorFusionView;
