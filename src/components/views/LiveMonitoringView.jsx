import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, Grid, Chip } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useHistoryStore from '../../store/historyStore';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';

const timeRanges = [
  { id: '1m', label: '1 Min', points: 12 },
  { id: '5m', label: '5 Min', points: 60 },
  { id: '30m', label: '30 Min', points: 120 },
  { id: '1h', label: '1 Hour', points: 240 },
  { id: '6h', label: '6 Hours', points: 360 },
  { id: '24h', label: '24 Hours', points: 500 },
];

const LiveMonitoringView = () => {
  const C = useColors();
  const { history, selectedTimeRange, setSelectedTimeRange } = useHistoryStore();
  const { selectedDevice } = useDeviceStore();

  const activeNode = selectedDevice === 'ESP02' ? 'esp02' : 'esp01';

  const rangeObj = timeRanges.find(r => r.id === selectedTimeRange) || timeRanges[1];
  const chartData = history.slice(-rangeObj.points).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    dht_raw: point[`${activeNode}_dht_raw`] || 26.5,
    dht_cal: point[`${activeNode}_dht_cal`] || 27.0,
    ds18_raw: point[`${activeNode}_ds18_raw`] || 27.5,
    ds18_cal: point[`${activeNode}_ds18_cal`] || 27.3,
    fused: point[`${activeNode}_fused`] || 27.2
  }));

  // Statistics calculations
  const fusedValues = chartData.map(d => d.fused);
  const avgTemp = fusedValues.length > 0 ? (fusedValues.reduce((a, b) => a + b, 0) / fusedValues.length).toFixed(2) : '--';
  const minTemp = fusedValues.length > 0 ? Math.min(...fusedValues).toFixed(2) : '--';
  const maxTemp = fusedValues.length > 0 ? Math.max(...fusedValues).toFixed(2) : '--';

  return (
    <Box>
      {/* Top Controls & Time Range Selector */}
      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.85) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                Real-Time 5-Series Temperature Telemetry ({activeNode.toUpperCase()})
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Comparing Raw DHT22, Calibrated DHT22, Raw DS18B20, Calibrated DS18B20, and Fused Kalman Output
              </Typography>
            </Box>

            {/* Time Range Pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {timeRanges.map(r => (
                <Button
                  key={r.id}
                  size="small"
                  onClick={() => setSelectedTimeRange(r.id)}
                  sx={{
                    px: 1.8, py: 0.5,
                    fontSize: '0.75rem', fontWeight: 700,
                    borderRadius: '8px',
                    color: selectedTimeRange === r.id ? '#090E17' : 'rgba(255, 255, 255, 0.7)',
                    background: selectedTimeRange === r.id ? 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: selectedTimeRange === r.id ? '0 0 12px rgba(0, 242, 254, 0.3)' : 'none'
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Summary KPI Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#00F2FE', fontWeight: 700 }}>AVERAGE TEMPERATURE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>{avgTemp} °C</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(79, 172, 254, 0.08)', border: '1px solid rgba(79, 172, 254, 0.25)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#4FACFE', fontWeight: 700 }}>MINIMUM TEMPERATURE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>{minTemp} °C</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(255, 171, 0, 0.08)', border: '1px solid rgba(255, 171, 0, 0.25)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#FFAB00', fontWeight: 700 }}>MAXIMUM TEMPERATURE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>{maxTemp} °C</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Main 5-Series Chart */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.85) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        p: 3
      }}>
        <Box sx={{ width: '100%', height: 440 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: '#090E17', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: 10, color: '#FFF' }} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              
              <Line type="monotone" dataKey="dht_raw" name="DHT22 Raw" stroke="#8884d8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="dht_cal" name="DHT22 Calibrated" stroke="#4FACFE" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ds18_raw" name="DS18B20 Raw" stroke="#ffc658" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="ds18_cal" name="DS18B20 Calibrated" stroke="#FFAB00" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fused" name="Kalman Fused Temp" stroke="#00F2FE" strokeWidth={3.5} dot={{ r: 3, fill: '#00F2FE' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default LiveMonitoringView;
