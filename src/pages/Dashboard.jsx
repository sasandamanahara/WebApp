import React, { useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import KpiCards from '../components/cards/KpiCards';
import DeviceCard from '../components/cards/DeviceCard';
import TemperatureChart from '../components/charts/TemperatureChart';
import SensorComparisonChart from '../components/charts/SensorComparisonChart';
import GpsMap from '../components/maps/GpsMap';
import AlarmTable from '../components/alarms/AlarmTable';
import useDeviceStore from '../store/deviceStore';
import { initMqttClient, disconnectMqttClient } from '../services/mqttClient';
import useColors from '../hooks/useColors';

const SectionLabel = ({ label }) => {
  const C = useColors();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.14em', fontWeight: 700 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
    </Box>
  );
};

const Dashboard = () => {
  const devices = useDeviceStore(state => state.devices);

  useEffect(() => {
    initMqttClient();
    return () => disconnectMqttClient();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>

          <SectionLabel label="System Overview" />
          <KpiCards />

          <SectionLabel label="Node Monitoring" />
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={6}><DeviceCard device={devices.ESP01} /></Grid>
            <Grid item xs={12} md={6}><DeviceCard device={devices.ESP02} /></Grid>
          </Grid>

          <SectionLabel label="Real-Time Telemetry" />
          <Box sx={{ mb: 5 }}><TemperatureChart /></Box>

          <SectionLabel label="Sensor Fusion Analysis" />
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={6}><SensorComparisonChart deviceId="ESP01" /></Grid>
            <Grid item xs={12} md={6}><SensorComparisonChart deviceId="ESP02" /></Grid>
          </Grid>

          <SectionLabel label="Geospatial View & Alarm Management" />
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={7}><GpsMap /></Grid>
            <Grid item xs={12} md={5}><AlarmTable /></Grid>
          </Grid>

        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;
