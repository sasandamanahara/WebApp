import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Tabs, Tab, Stack, Button, Tooltip, IconButton, Menu, MenuItem } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import SensorsIcon from '@mui/icons-material/Sensors';
import TimelineIcon from '@mui/icons-material/Timeline';
import FunctionsIcon from '@mui/icons-material/Functions';
import TuneIcon from '@mui/icons-material/Tune';
import MapIcon from '@mui/icons-material/Map';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import DnsIcon from '@mui/icons-material/Dns';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import useDeviceStore from '../../store/deviceStore';
import useAlarmStore from '../../store/alarmStore';
import useColors from '../../hooks/useColors';

const navItems = [
  { id: 'overview', label: 'Overview', icon: <SensorsIcon fontSize="small" /> },
  { id: 'live', label: 'Live Monitoring', icon: <TimelineIcon fontSize="small" /> },
  { id: 'fusion', label: 'Sensor Fusion', icon: <FunctionsIcon fontSize="small" /> },
  { id: 'calibration', label: 'Calibration', icon: <TuneIcon fontSize="small" /> },
  { id: 'gps', label: 'GPS / Location', icon: <MapIcon fontSize="small" /> },
  { id: 'led', label: 'LED Controls', icon: <ToggleOnIcon fontSize="small" /> },
  { id: 'alarms', label: 'Alarms & Events', icon: <NotificationsActiveIcon fontSize="small" /> },
  { id: 'history', label: 'History Logs', icon: <HistoryIcon fontSize="small" /> },
  { id: 'system', label: 'MQTT Diagnostics', icon: <DnsIcon fontSize="small" /> }
];

const Header = () => {
  const C = useColors();
  const { activeView, setActiveView, selectedDevice, setSelectedDevice, backendConnected, mqttConnected } = useDeviceStore();
  const { alarms } = useAlarmStore();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const unackAlarmsCount = alarms.filter(a => !a.acknowledged).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'linear-gradient(180deg, rgba(13, 20, 36, 0.95) 0%, rgba(8, 14, 26, 0.98) 100%)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 1100
    }}>
      {/* Top SCADA Branding Bar */}
      <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', py: 1.5, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          
          {/* Logo & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
            }}>
              <MemoryIcon sx={{ color: '#090E17', fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.04em', fontSize: { xs: '1rem', md: '1.15rem' }, color: '#FFFFFF' }}>
                  SMART TEMPERATURE MONITORING SYSTEM
                </Typography>
                <Chip label="EE2120 SCADA" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0, 242, 254, 0.15)', color: '#00F2FE', border: '1px solid rgba(0, 242, 254, 0.3)' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                University of Peradeniya • Dual-Node Sensor Fusion & GNSS Network
              </Typography>
            </Box>
          </Box>

          {/* Node Selector & Real-Time Indicators */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {/* Dual Node Selector Pills */}
            <Box sx={{ display: 'flex', bgcolor: 'rgba(255, 255, 255, 0.04)', p: 0.5, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {['ALL', 'ESP01', 'ESP02'].map(node => (
                <Button
                  key={node}
                  size="small"
                  onClick={() => setSelectedDevice(node)}
                  sx={{
                    px: 1.5,
                    py: 0.4,
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    color: selectedDevice === node ? '#090E17' : 'rgba(255, 255, 255, 0.7)',
                    background: selectedDevice === node ? 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' : 'transparent',
                    boxShadow: selectedDevice === node ? '0 0 10px rgba(0, 242, 254, 0.3)' : 'none',
                    '&:hover': { color: selectedDevice === node ? '#090E17' : '#FFFFFF' }
                  }}
                >
                  {node === 'ALL' ? 'Dual Nodes' : node}
                </Button>
              ))}
            </Box>

            {/* MQTT Broker Status */}
            <Tooltip title={mqttConnected ? "MQTT Broker Connected (10.15.0.3:1883)" : "MQTT Broker Offline (Using Mock Telemetry Stream)"}>
              <Chip
                icon={mqttConnected ? <WifiIcon style={{ color: '#00E676', fontSize: 16 }} /> : <WifiOffIcon style={{ color: '#FFAB00', fontSize: 16 }} />}
                label={mqttConnected ? "MQTT 10.15.0.3" : "SIMULATOR MODE"}
                size="small"
                sx={{
                  bgcolor: mqttConnected ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 171, 0, 0.12)',
                  color: mqttConnected ? '#00E676' : '#FFAB00',
                  border: `1px solid ${mqttConnected ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 171, 0, 0.3)'}`,
                  fontWeight: 700,
                  fontSize: '0.7rem'
                }}
              />
            </Tooltip>

            {/* Active Alarms Badge */}
            <IconButton onClick={() => setActiveView('alarms')} size="small" sx={{ bgcolor: unackAlarmsCount > 0 ? 'rgba(255, 23, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: unackAlarmsCount > 0 ? '#FF1744' : 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <NotificationsActiveIcon fontSize="small" />
              {unackAlarmsCount > 0 && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF1744', position: 'absolute', top: 4, right: 4, animation: 'pulse 1.5s infinite' }} />
              )}
            </IconButton>

            {/* Live Clock */}
            <Typography variant="caption" sx={{ color: '#00F2FE', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', bgcolor: 'rgba(0, 242, 254, 0.08)', px: 1.5, py: 0.5, borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
              {currentTime}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Navigation Tabs Bar */}
      <Box sx={{ px: { xs: 1, md: 3 }, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Tabs
          value={activeView}
          onChange={(e, val) => setActiveView(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          IndicatorColor="primary"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #00F2FE 0%, #4FACFE 100%)',
              boxShadow: '0 0 12px #00F2FE'
            }
          }}
        >
          {navItems.map(item => (
            <Tab
              key={item.id}
              value={item.id}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              sx={{
                minHeight: 48,
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'none',
                color: activeView === item.id ? '#00F2FE' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.03)' }
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default Header;
