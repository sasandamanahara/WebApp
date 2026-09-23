import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Stack, TextField } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import useHistoryStore from '../../store/historyStore';
import useDeviceStore from '../../store/deviceStore';
import useColors from '../../hooks/useColors';

const HistoryView = () => {
  const C = useColors();
  const { history } = useHistoryStore();
  const { selectedDevice, setSelectedDevice } = useDeviceStore();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(row => {
    if (!searchTerm) return true;
    const timeStr = new Date(row.timestamp).toLocaleString().toLowerCase();
    return timeStr.includes(searchTerm.toLowerCase());
  });

  const handleExportCsv = () => {
    if (history.length === 0) return;

    const headers = [
      'Timestamp', 'ISO_Date',
      'ESP01_DHT22_Raw', 'ESP01_DHT22_Calibrated', 'ESP01_DS18B20_Raw', 'ESP01_DS18B20_Calibrated', 'ESP01_Difference', 'ESP01_Fused_Temp',
      'ESP02_DHT22_Raw', 'ESP02_DHT22_Calibrated', 'ESP02_DS18B20_Raw', 'ESP02_DS18B20_Calibrated', 'ESP02_Difference', 'ESP02_Fused_Temp'
    ];

    const csvRows = [headers.join(',')];

    history.forEach(row => {
      const values = [
        row.timestamp,
        `"${new Date(row.timestamp).toISOString()}"`,
        row.esp01_dht_raw, row.esp01_dht_cal, row.esp01_ds18_raw, row.esp01_ds18_cal, row.esp01_diff, row.esp01_fused,
        row.esp02_dht_raw, row.esp02_dht_cal, row.esp02_ds18_raw, row.esp02_ds18_cal, row.esp02_diff, row.esp02_fused
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EE2120_Telemetry_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      {/* Header Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(10, 18, 33, 0.95) 100%)',
        border: '1px solid rgba(79, 172, 254, 0.3)',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HistoryIcon sx={{ color: '#4FACFE', fontSize: 36 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  Timestamped Telemetry History Log & CSV Exporter
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Recorded Log Entries: <strong style={{ color: '#00F2FE' }}>{history.length} data points</strong>
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExportCsv}
              sx={{ px: 3, py: 1, fontWeight: 800, borderRadius: '10px' }}
            >
              Export Dataset to CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              placeholder="Search by timestamp or time string..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {['ALL', 'ESP01', 'ESP02'].map(node => (
                <Button
                  key={node}
                  size="small"
                  variant={selectedDevice === node ? 'contained' : 'outlined'}
                  onClick={() => setSelectedDevice(node)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {node}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Main Data Table */}
      <Card sx={{ bgcolor: 'rgba(16, 26, 48, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Timestamp</TableCell>
              {(selectedDevice === 'ALL' || selectedDevice === 'ESP01') && (
                <>
                  <TableCell sx={{ color: '#00F2FE', fontWeight: 700 }}>ESP01 DHT22 Raw/Cal</TableCell>
                  <TableCell sx={{ color: '#00F2FE', fontWeight: 700 }}>ESP01 DS18B20 Raw/Cal</TableCell>
                  <TableCell sx={{ color: '#00F2FE', fontWeight: 700 }}>ESP01 Diff / Fused</TableCell>
                </>
              )}
              {(selectedDevice === 'ALL' || selectedDevice === 'ESP02') && (
                <>
                  <TableCell sx={{ color: '#FFAB00', fontWeight: 700 }}>ESP02 DHT22 Raw/Cal</TableCell>
                  <TableCell sx={{ color: '#FFAB00', fontWeight: 700 }}>ESP02 DS18B20 Raw/Cal</TableCell>
                  <TableCell sx={{ color: '#FFAB00', fontWeight: 700 }}>ESP02 Diff / Fused</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
              <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell sx={{ color: '#FFF', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </TableCell>

                {(selectedDevice === 'ALL' || selectedDevice === 'ESP01') && (
                  <>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      {row.esp01_dht_raw}°C / <strong style={{ color: '#00F2FE' }}>{row.esp01_dht_cal}°C</strong>
                    </TableCell>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      {row.esp01_ds18_raw}°C / <strong style={{ color: '#00F2FE' }}>{row.esp01_ds18_cal}°C</strong>
                    </TableCell>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      Δ {row.esp01_diff}°C | <strong style={{ color: '#00E676' }}>{row.esp01_fused}°C</strong>
                    </TableCell>
                  </>
                )}

                {(selectedDevice === 'ALL' || selectedDevice === 'ESP02') && (
                  <>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      {row.esp02_dht_raw}°C / <strong style={{ color: '#FFAB00' }}>{row.esp02_dht_cal}°C</strong>
                    </TableCell>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      {row.esp02_ds18_raw}°C / <strong style={{ color: '#FFAB00' }}>{row.esp02_ds18_cal}°C</strong>
                    </TableCell>
                    <TableCell sx={{ color: '#FFF', fontSize: '0.8rem' }}>
                      Δ {row.esp02_diff}°C | <strong style={{ color: '#00E676' }}>{row.esp02_fused}°C</strong>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredHistory.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
        />
      </Card>
    </Box>
  );
};

export default HistoryView;
