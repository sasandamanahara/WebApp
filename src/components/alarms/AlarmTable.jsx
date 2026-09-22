import React from 'react';
import {
  Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Slider
} from '@mui/material';
import { CheckCircle as AckIcon, NotificationsActive as AlarmIcon, Tune as TuneIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import useAlarmStore from '../../store/alarmStore';
import useColors from '../../hooks/useColors';

const AlarmTable = () => {
  const C = useColors();
  const { alarms, acknowledgeAlarm, threshold, setThreshold } = useAlarmStore();
  const activeCount = alarms.filter(a => a.status === 'ACTIVE').length;

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {activeCount > 0 && (
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`,
        }} />
      )}

      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              background: activeCount > 0 ? `${C.red}18` : `${C.green}18`,
              border: `1px solid ${activeCount > 0 ? C.red : C.green}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlarmIcon sx={{ color: activeCount > 0 ? C.red : C.green, fontSize: 16 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Alarm Log</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {activeCount > 0 ? `${activeCount} active alarm${activeCount > 1 ? 's' : ''}` : 'No active alarms'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Threshold slider */}
        <Box sx={{ p: 2, mb: 2.5, borderRadius: '10px', background: 'rgba(128,128,128,0.06)', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TuneIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                High-Temp Threshold
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: C.amber, fontFamily: '"Roboto Mono", monospace' }}>
              {threshold} °C
            </Typography>
          </Box>
          <Slider
            value={threshold}
            min={20} max={60} step={0.5}
            onChange={(_, val) => setThreshold(val)}
            sx={{
              color: C.amber, height: 4,
              '& .MuiSlider-thumb': { width: 14, height: 14, '&:hover': { boxShadow: `0 0 12px ${C.amber}60` } },
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 220 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Node</TableCell>
                <TableCell>Temp</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ width: 40 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alarms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center', border: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <AlarmIcon sx={{ color: C.green, fontSize: 28, opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>All systems nominal — no alarms triggered</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                alarms.slice(0, 50).map((alarm) => (
                  <TableRow key={alarm.id} hover>
                    <TableCell sx={{ color: 'text.secondary', fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem' }}>
                      {format(new Date(alarm.timestamp), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: alarm.device === 'ESP01' ? C.esp01 : C.esp02, fontSize: '0.78rem' }}>
                        {alarm.device}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: C.red, fontWeight: 700, fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem' }}>
                      {alarm.temperature.toFixed(2)} °C
                    </TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center',
                        px: 1, py: 0.25, borderRadius: '20px',
                        background: alarm.status === 'ACTIVE' ? `${C.red}15` : 'rgba(128,128,128,0.1)',
                        border: `1px solid ${alarm.status === 'ACTIVE' ? C.red + '40' : 'rgba(128,128,128,0.2)'}`,
                      }}>
                        <Typography variant="caption" sx={{ color: alarm.status === 'ACTIVE' ? C.red : 'text.disabled', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                          {alarm.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {alarm.status === 'ACTIVE' && (
                        <Tooltip title="Acknowledge alarm" arrow>
                          <IconButton size="small" onClick={() => acknowledgeAlarm(alarm.id)} sx={{ color: C.green, '&:hover': { bgcolor: `${C.green}18` } }}>
                            <AckIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default AlarmTable;
