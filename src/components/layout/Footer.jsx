import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 4,
        background: 'rgba(7,12,24,0.8)',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        backdropFilter: 'blur(12px)',
        textAlign: 'center',
      }}
    >
      <Box sx={{
        width: 48, height: 1, bgcolor: 'rgba(0,212,255,0.3)',
        mx: 'auto', mb: 2,
      }} />
      <Typography variant="caption" sx={{ color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em', display: 'block' }}>
        EE2120 • ELECTRICAL MEASUREMENTS AND INSTRUMENTATION
      </Typography>
      <Typography variant="caption" sx={{ color: '#4a5568', display: 'block', mt: 0.5 }}>
        Group 18 &nbsp;|&nbsp; Module Code: E2120 &nbsp;|&nbsp; Distributed Temperature Monitoring & IoT SCADA System
      </Typography>
    </Box>
  );
};

export default Footer;
