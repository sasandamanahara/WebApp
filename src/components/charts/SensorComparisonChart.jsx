import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useHistoryStore from '../../store/historyStore';
import { format } from 'date-fns';
import { BubbleChart as FusionIcon } from '@mui/icons-material';
import useColors from '../../hooks/useColors';
import { useTheme } from '@mui/material/styles';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 1.5, minWidth: 180, bgcolor: 'background.paper', boxShadow: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
          {label ? format(new Date(label), 'HH:mm:ss') : ''}
        </Typography>
        {payload.map(p => (
          <Box key={p.dataKey} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.25 }}>
            <Typography variant="caption" sx={{ color: p.stroke, fontWeight: 600 }}>{p.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontFamily: '"Roboto Mono", monospace' }}>
              {p.value !== undefined ? `${p.value.toFixed(2)} °C` : '—'}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const SensorComparisonChart = ({ deviceId }) => {
  const C = useColors();
  const theme = useTheme();
  const history = useHistoryStore(state => state.history);
  const formatTime = (time) => format(new Date(time), 'HH:mm:ss');
  const prefix = deviceId.toLowerCase();
  const nodeColor = deviceId === 'ESP01' ? C.esp01 : C.esp02;
  const gridColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const axisColor = theme.palette.mode === 'dark' ? '#4a5568' : '#8892a4';

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: `${nodeColor}18`, border: `1px solid ${nodeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FusionIcon sx={{ color: nodeColor, fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Sensor Fusion Analysis</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{deviceId} · DHT22 vs DS18B20 vs Kalman</Typography>
          </Box>
        </Box>

        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={40} tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Poppins' }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°`} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11, fontFamily: 'Poppins', color: axisColor }} />
              <Line type="monotone" dataKey={`${prefix}_dht`} name="DHT22" stroke={C.dht22} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: C.dht22 }} />
              <Line type="monotone" dataKey={`${prefix}_ds18`} name="DS18B20" stroke={C.ds18b20} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: C.ds18b20 }} />
              <Line type="monotone" dataKey={`${prefix}_fused`} name="Kalman Fused" stroke={nodeColor} strokeWidth={3} dot={false} isAnimationActive={false} activeDot={{ r: 5, fill: nodeColor, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {history.length === 0 && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, bgcolor: 'background.paper', borderRadius: 'inherit' }}>
            <FusionIcon sx={{ color: 'text.disabled', fontSize: 36 }} />
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Waiting for sensor data…</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorComparisonChart;
