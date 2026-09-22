import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import useHistoryStore from '../../store/historyStore';
import useAlarmStore from '../../store/alarmStore';
import { format } from 'date-fns';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import useColors from '../../hooks/useColors';
import { useTheme } from '@mui/material/styles';

const CustomTooltip = ({ active, payload, label, C }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 1.5, minWidth: 170, bgcolor: 'background.paper', boxShadow: 3 }}>
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

const TemperatureChart = () => {
  const C = useColors();
  const theme = useTheme();
  const history = useHistoryStore(state => state.history);
  const threshold = useAlarmStore(state => state.threshold);
  const formatTime = (time) => format(new Date(time), 'HH:mm:ss');

  const gridColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const axisColor = theme.palette.mode === 'dark' ? '#4a5568' : '#8892a4';

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: `${C.accent}18`, border: `1px solid ${C.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TimelineIcon sx={{ color: C.accent, fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Real-Time Fused Temperature</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Kalman-filtered sensor fusion output · Live stream</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.green, boxShadow: `0 0 8px ${C.green}` }} className="pulse-online" />
            <Typography variant="caption" sx={{ color: C.green, fontWeight: 700, fontSize: '0.7rem' }}>LIVE</Typography>
          </Box>
        </Box>

        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={40} tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Poppins' }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°`} width={36} />
              <Tooltip content={<CustomTooltip C={C} />} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12, fontFamily: 'Poppins', color: axisColor }} />
              <ReferenceLine y={threshold} stroke={C.red} strokeDasharray="6 3" strokeOpacity={0.7} label={{ value: `Alarm: ${threshold}°C`, fill: C.red, fontSize: 11, position: 'right' }} />
              <Line type="monotone" dataKey="esp01_fused" name="ESP01 Fused" stroke={C.esp01} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r: 5, fill: C.esp01, stroke: 'transparent', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="esp02_fused" name="ESP02 Fused" stroke={C.esp02} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r: 5, fill: C.esp02, stroke: 'transparent', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {history.length === 0 && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, bgcolor: 'background.paper', borderRadius: 'inherit' }}>
            <TimelineIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Waiting for sensor data…</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TemperatureChart;
