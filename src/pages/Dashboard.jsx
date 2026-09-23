import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import OverviewView from '../components/views/OverviewView';
import LiveMonitoringView from '../components/views/LiveMonitoringView';
import SensorFusionView from '../components/views/SensorFusionView';
import CalibrationView from '../components/views/CalibrationView';
import GpsMap from '../components/maps/GpsMap';
import LedControlPanel from '../components/views/LedControlPanel';
import AlarmsView from '../components/views/AlarmsView';
import HistoryView from '../components/views/HistoryView';
import SystemDiagnosticsView from '../components/views/SystemDiagnosticsView';
import useDeviceStore from '../store/deviceStore';
import { initWebSocketClient } from '../services/webSocketClient';

const Dashboard = () => {
  const activeView = useDeviceStore(state => state.activeView);

  useEffect(() => {
    initWebSocketClient();
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'live':
        return <LiveMonitoringView />;
      case 'fusion':
        return <SensorFusionView />;
      case 'calibration':
        return <CalibrationView />;
      case 'gps':
        return <GpsMap />;
      case 'led':
        return <LedControlPanel />;
      case 'alarms':
        return <AlarmsView />;
      case 'history':
        return <HistoryView />;
      case 'system':
        return <SystemDiagnosticsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#090E17',
      color: '#FFFFFF',
      position: 'relative',
      zIndex: 1
    }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          {renderActiveView()}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;
