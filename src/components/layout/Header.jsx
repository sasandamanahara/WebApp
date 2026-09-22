import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Tooltip,
  IconButton, useTheme, Switch, Divider
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  AccessTime as ClockIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import useMqttStore from '../../store/mqttStore';
import { useThemeMode } from '../../theme/ThemeContext';
import useColors from '../../hooks/useColors';
import { format } from 'date-fns';

const Header = () => {
  const { connected } = useMqttStore();
  const { mode, toggleTheme } = useThemeMode();
  const C = useColors();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(24px)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, px: { xs: 2, md: 4 }, gap: 1 }}>

        {/* ── Logo ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
          <Box sx={{
            width: 38, height: 38,
            borderRadius: '10px',
            background: `${C.accent}18`,
            border: `1px solid ${C.accent}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${C.accent}25`,
          }}>
            <SensorsIcon sx={{ color: C.accent, fontSize: 20 }} />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle1" sx={{
              fontWeight: 700, lineHeight: 1.2, color: C.textPrimary, letterSpacing: '-0.01em'
            }}>
              Distributed Temp Monitor
            </Typography>
            <Typography variant="caption" sx={{ color: C.accent, fontWeight: 600, letterSpacing: '0.08em' }}>
              EE2120 • IoT SCADA
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* ── Live Clock ── */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2, color: C.textMuted }}>
          <ClockIcon sx={{ fontSize: 15 }} />
          <Typography variant="body2" sx={{
            fontFamily: '"Roboto Mono", monospace',
            color: C.textSecondary,
            fontSize: '0.8rem'
          }}>
            {format(currentTime, 'HH:mm:ss')} · {format(currentTime, 'dd MMM yyyy')}
          </Typography>
        </Box>

        {/* ── MQTT Status ── */}
        <Tooltip title={connected ? 'MQTT Broker Connected' : 'MQTT Broker Disconnected'} arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, cursor: 'default' }}>
            <Box
              sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: connected ? C.green : C.red,
                boxShadow: `0 0 8px ${connected ? C.green : C.red}`,
              }}
              className={connected ? 'pulse-online' : 'pulse-offline'}
            />
            <Typography variant="caption" sx={{
              fontWeight: 700, color: connected ? C.green : C.red,
              letterSpacing: '0.06em', display: { xs: 'none', sm: 'block' }, fontSize: '0.7rem'
            }}>
              {connected ? 'MQTT LIVE' : 'NO SIGNAL'}
            </Typography>
          </Box>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ borderColor: C.border, mx: 1 }} />

        {/* ── Dark / Light toggle ── */}
        <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`} arrow>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1.5, py: 0.75,
            borderRadius: '24px',
            border: `1px solid ${C.border}`,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              border: `1px solid ${C.accent}50`,
              background: `${C.accent}10`,
            },
          }}
            onClick={toggleTheme}
          >
            <LightModeIcon sx={{
              fontSize: 16,
              color: isDark ? C.textMuted : C.amber,
              transition: 'color 0.2s ease',
            }} />
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              size="small"
              onClick={e => e.stopPropagation()} // prevent double-fire
              sx={{
                width: 36, height: 20, p: 0,
                '& .MuiSwitch-switchBase': {
                  p: 0.25,
                  '&.Mui-checked': {
                    transform: 'translateX(16px)',
                    '& + .MuiSwitch-track': { bgcolor: C.accent, opacity: 0.8 },
                  },
                },
                '& .MuiSwitch-thumb': {
                  width: 15, height: 15,
                  bgcolor: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                },
                '& .MuiSwitch-track': {
                  borderRadius: 10,
                  bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
                  opacity: '1 !important',
                },
              }}
            />
            <DarkModeIcon sx={{
              fontSize: 16,
              color: isDark ? C.accent : C.textMuted,
              transition: 'color 0.2s ease',
            }} />
          </Box>
        </Tooltip>

      </Toolbar>
    </AppBar>
  );
};

export default Header;
