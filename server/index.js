import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import mqtt from 'mqtt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'tcp://10.15.0.3:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'ignition_scada';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';

// System State for ESP01 and ESP02
const systemState = {
  ESP01: {
    deviceId: 'ESP01',
    status: 'online',
    lastSeen: Date.now(),
    dht_raw: 26.8,
    dht_calibrated: 27.1,
    ds18b20_raw: 27.6,
    ds18b20_calibrated: 27.4,
    difference: 0.3,
    fused_temperature: 27.28,
    kalman_details: {
      previous_estimate: 27.25,
      predicted_estimate: 27.27,
      k_dht: 0.45,
      k_ds18: 0.55,
      var_dht: 0.12,
      var_ds18: 0.08,
      process_noise: 0.02,
      error_covariance: 0.04
    },
    calibration: {
      dht_slope: 1.01,
      dht_offset: 0.02,
      ds18_slope: 0.99,
      ds18_offset: 0.07,
      mae: 0.18,
      rmse: 0.22,
      std_dev: 0.14
    },
    gps: {
      latitude: 7.2543,
      longitude: 80.5916,
      satellites: 9,
      gps_status: '3D FIX',
      valid: true
    },
    led1: { actual_state: 'OFF', cmd_state: 'OFF' },
    led2: { actual_state: 'OFF', cmd_state: 'OFF' }
  },
  ESP02: {
    deviceId: 'ESP02',
    status: 'online',
    lastSeen: Date.now(),
    dht_raw: 28.2,
    dht_calibrated: 28.5,
    ds18b20_raw: 28.9,
    ds18b20_calibrated: 28.7,
    difference: 0.2,
    fused_temperature: 28.61,
    kalman_details: {
      previous_estimate: 28.58,
      predicted_estimate: 28.60,
      k_dht: 0.48,
      k_ds18: 0.52,
      var_dht: 0.14,
      var_ds18: 0.09,
      process_noise: 0.02,
      error_covariance: 0.045
    },
    calibration: {
      dht_slope: 1.02,
      dht_offset: -0.05,
      ds18_slope: 0.98,
      ds18_offset: 0.11,
      mae: 0.15,
      rmse: 0.19,
      std_dev: 0.12
    },
    gps: {
      latitude: 7.2558,
      longitude: 80.5932,
      satellites: 11,
      gps_status: '3D FIX',
      valid: true
    },
    led1: { actual_state: 'OFF', cmd_state: 'OFF' },
    led2: { actual_state: 'OFF', cmd_state: 'OFF' }
  }
};

// Historical buffer
const historicalLogs = [];
const MAX_HISTORY = 500;

// Alarm Store
const activeAlarms = [];
let highTempThreshold = 32.0;
let mismatchThreshold = 1.5;

function addHistoricalPoint() {
  const timestamp = Date.now();
  const logPoint = {
    timestamp,
    esp01_dht_raw: systemState.ESP01.dht_raw,
    esp01_dht_cal: systemState.ESP01.dht_calibrated,
    esp01_ds18_raw: systemState.ESP01.ds18b20_raw,
    esp01_ds18_cal: systemState.ESP01.ds18b20_calibrated,
    esp01_diff: systemState.ESP01.difference,
    esp01_fused: systemState.ESP01.fused_temperature,

    esp02_dht_raw: systemState.ESP02.dht_raw,
    esp02_dht_cal: systemState.ESP02.dht_calibrated,
    esp02_ds18_raw: systemState.ESP02.ds18b20_raw,
    esp02_ds18_cal: systemState.ESP02.ds18b20_calibrated,
    esp02_diff: systemState.ESP02.difference,
    esp02_fused: systemState.ESP02.fused_temperature,
  };

  historicalLogs.push(logPoint);
  if (historicalLogs.length > MAX_HISTORY) {
    historicalLogs.shift();
  }
}

// Populate initial history for instant charts
const now = Date.now();
for (let i = 60; i >= 0; i--) {
  const t = now - i * 5000;
  const t1 = 27.2 + Math.sin(i * 0.1) * 0.8 + (Math.random() - 0.5) * 0.2;
  const t2 = 28.5 + Math.cos(i * 0.1) * 0.7 + (Math.random() - 0.5) * 0.2;
  historicalLogs.push({
    timestamp: t,
    esp01_dht_raw: Number((t1 - 0.3).toFixed(2)),
    esp01_dht_cal: Number(t1.toFixed(2)),
    esp01_ds18_raw: Number((t1 + 0.2).toFixed(2)),
    esp01_ds18_cal: Number((t1 + 0.1).toFixed(2)),
    esp01_diff: 0.1,
    esp01_fused: Number((t1 + 0.05).toFixed(2)),

    esp02_dht_raw: Number((t2 - 0.3).toFixed(2)),
    esp02_dht_cal: Number(t2.toFixed(2)),
    esp02_ds18_raw: Number((t2 + 0.2).toFixed(2)),
    esp02_ds18_cal: Number((t2 + 0.1).toFixed(2)),
    esp02_diff: 0.1,
    esp02_fused: Number((t2 + 0.05).toFixed(2))
  });
}

// MQTT Client Connection
let mqttClient = null;
let isMqttConnected = false;

function connectMqtt() {
  console.log(`Connecting to MQTT broker at ${MQTT_BROKER_URL}...`);
  const options = {
    clientId: `scada_backend_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 4000
  };
  if (MQTT_USERNAME) options.username = MQTT_USERNAME;
  if (MQTT_PASSWORD) options.password = MQTT_PASSWORD;

  try {
    mqttClient = mqtt.connect(MQTT_BROKER_URL, options);

    mqttClient.on('connect', () => {
      console.log('✅ MQTT Connected to Mosquitto Broker!');
      isMqttConnected = true;

      mqttClient.subscribe('EE2120/#');
      mqttClient.subscribe('EE2120/+/temp');
      mqttClient.subscribe('EE2120/+/gps');
      mqttClient.subscribe('EE2120/+/status');
      mqttClient.subscribe('EE2120/+/LED/status');
      mqttClient.subscribe('EE2120/+/LED1/status');
      mqttClient.subscribe('EE2120/+/LED2/status');
    });

    mqttClient.on('message', (topic, payload) => {
      handleIncomingMqttMessage(topic, payload.toString());
    });

    mqttClient.on('error', (err) => {
      console.log('⚠️ MQTT Broker unreachable:', err.message);
      isMqttConnected = false;
    });

    mqttClient.on('close', () => {
      isMqttConnected = false;
    });
  } catch (e) {
    console.error('MQTT setup error:', e.message);
  }
}

function handleIncomingMqttMessage(topic, messageStr) {
  const parts = topic.split('/');
  // EE2120/ESP01/temp or EE2120/ESP01/LED1/status etc.
  if (parts.length < 3) return;
  const deviceId = parts[1]; // ESP01 or ESP02
  if (!systemState[deviceId]) return;

  systemState[deviceId].lastSeen = Date.now();
  systemState[deviceId].status = 'online';

  try {
    // Check if JSON
    if (messageStr.startsWith('{')) {
      const data = JSON.parse(messageStr);
      if (data.dht_raw !== undefined) systemState[deviceId].dht_raw = parseFloat(data.dht_raw);
      if (data.dht_calibrated !== undefined) systemState[deviceId].dht_calibrated = parseFloat(data.dht_calibrated);
      if (data.ds18b20_raw !== undefined) systemState[deviceId].ds18b20_raw = parseFloat(data.ds18b20_raw);
      if (data.ds18b20_calibrated !== undefined) systemState[deviceId].ds18b20_calibrated = parseFloat(data.ds18b20_calibrated);
      if (data.difference !== undefined) systemState[deviceId].difference = parseFloat(data.difference);
      if (data.fused_temperature !== undefined) systemState[deviceId].fused_temperature = parseFloat(data.fused_temperature);

      if (data.latitude !== undefined && data.longitude !== undefined) {
        systemState[deviceId].gps.latitude = parseFloat(data.latitude);
        systemState[deviceId].gps.longitude = parseFloat(data.longitude);
        systemState[deviceId].gps.valid = true;
      }
      if (data.satellites !== undefined) systemState[deviceId].gps.satellites = parseInt(data.satellites);
      if (data.gps_status !== undefined) systemState[deviceId].gps.gps_status = data.gps_status;

      if (data.led1 !== undefined) systemState[deviceId].led1.actual_state = data.led1 === 1 || data.led1 === 'ON' ? 'ON' : 'OFF';
      if (data.led2 !== undefined) systemState[deviceId].led2.actual_state = data.led2 === 1 || data.led2 === 'ON' ? 'ON' : 'OFF';
    } else {
      // Simple string topics according to EE2120 standard
      const topicType = parts.slice(2).join('/');
      if (topicType === 'temp') {
        const val = parseFloat(messageStr);
        if (!isNaN(val)) systemState[deviceId].fused_temperature = val;
      } else if (topicType === 'gps') {
        const coords = messageStr.split(',');
        if (coords.length === 2) {
          systemState[deviceId].gps.latitude = parseFloat(coords[0]);
          systemState[deviceId].gps.longitude = parseFloat(coords[1]);
          systemState[deviceId].gps.valid = true;
        }
      } else if (topicType === 'status') {
        systemState[deviceId].status = messageStr.toLowerCase() === 'online' ? 'online' : 'offline';
      } else if (topicType === 'LED/status' || topicType === 'LED1/status') {
        systemState[deviceId].led1.actual_state = messageStr === '1' || messageStr === 'ON' ? 'ON' : 'OFF';
      } else if (topicType === 'LED2/status') {
        systemState[deviceId].led2.actual_state = messageStr === '1' || messageStr === 'ON' ? 'ON' : 'OFF';
      }
    }
  } catch (e) {
    console.error(`Error parsing message on ${topic}:`, e.message);
  }
}

// Real-time Mock Simulator (Runs when hardware is offline or to feed smooth telemetry)
setInterval(() => {
  ['ESP01', 'ESP02'].forEach(deviceId => {
    const dev = systemState[deviceId];

    // Simulate realistic small temperature fluctuations
    const baseTemp = deviceId === 'ESP01' ? 27.3 : 28.6;
    const noiseDht = (Math.random() - 0.48) * 0.15;
    const noiseDs18 = (Math.random() - 0.52) * 0.12;

    dev.dht_raw = Number((baseTemp - 0.35 + noiseDht).toFixed(2));
    dev.dht_calibrated = Number((dev.dht_raw * dev.calibration.dht_slope + dev.calibration.dht_offset).toFixed(2));

    dev.ds18b20_raw = Number((baseTemp + 0.18 + noiseDs18).toFixed(2));
    dev.ds18b20_calibrated = Number((dev.ds18b20_raw * dev.calibration.ds18_slope + dev.calibration.ds18_offset).toFixed(2));

    dev.difference = Number(Math.abs(dev.dht_calibrated - dev.ds18b20_calibrated).toFixed(2));

    // Live Kalman Sensor Fusion Calculation
    const z1 = dev.dht_calibrated;
    const z2 = dev.ds18b20_calibrated;
    const w1 = dev.kalman_details.k_dht;
    const w2 = dev.kalman_details.k_ds18;

    dev.kalman_details.previous_estimate = dev.fused_temperature;
    dev.kalman_details.predicted_estimate = Number((dev.fused_temperature + (Math.random() - 0.5) * 0.02).toFixed(2));
    dev.fused_temperature = Number((w1 * z1 + w2 * z2).toFixed(2));

    // Update GPS slight drift or satellite count
    dev.gps.satellites = Math.min(12, Math.max(7, dev.gps.satellites + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));

    // Check Alarms
    if (dev.fused_temperature > highTempThreshold) {
      if (!activeAlarms.some(a => a.deviceId === deviceId && a.type === 'High Temperature')) {
        activeAlarms.unshift({
          id: Date.now(),
          deviceId,
          type: 'High Temperature',
          severity: 'HIGH',
          message: `${deviceId} Fused Temp (${dev.fused_temperature}°C) exceeded threshold (${highTempThreshold}°C)`,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    }
    if (dev.difference > mismatchThreshold) {
      if (!activeAlarms.some(a => a.deviceId === deviceId && a.type === 'Sensor Mismatch')) {
        activeAlarms.unshift({
          id: Date.now() + 1,
          deviceId,
          type: 'Sensor Mismatch',
          severity: 'MEDIUM',
          message: `${deviceId} Sensor Mismatch (${dev.difference}°C) exceeded limit (${mismatchThreshold}°C)`,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    }
  });

  addHistoricalPoint();
  broadcastWebSocketState();
}, 1500);

// Express REST API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    mqttConnected: isMqttConnected,
    brokerUrl: MQTT_BROKER_URL,
    devices: systemState,
    thresholds: { highTempThreshold, mismatchThreshold }
  });
});

app.get('/api/history', (req, res) => {
  res.json(historicalLogs);
});

app.get('/api/alarms', (req, res) => {
  res.json(activeAlarms);
});

app.post('/api/alarms/ack', (req, res) => {
  const { id } = req.body;
  const alarm = activeAlarms.find(a => a.id === id);
  if (alarm) alarm.acknowledged = true;
  res.json({ success: true });
});

app.post('/api/led', (req, res) => {
  const { deviceId, ledNum, command } = req.body; // ledNum: 1 or 2, command: 'ON' or 'OFF'
  if (!systemState[deviceId]) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  const ledKey = ledNum === 2 ? 'led2' : 'led1';
  systemState[deviceId][ledKey].cmd_state = command;

  // Publish to MQTT if connected
  if (mqttClient && isMqttConnected) {
    const topic = `EE2120/${deviceId}/LED${ledNum}/cmd`;
    const payload = command === 'ON' ? '1' : '0';
    mqttClient.publish(topic, payload);
    mqttClient.publish(`EE2120/${deviceId}/LED/cmd`, payload);
  }

  // Simulator feedback loop (reflect actual status after 120ms delay)
  setTimeout(() => {
    systemState[deviceId][ledKey].actual_state = command;
    broadcastWebSocketState();
  }, 120);

  res.json({ success: true, deviceId, ledNum, command });
});

app.post('/api/telemetry', (req, res) => {
  const data = req.body;
  const deviceId = data.device || data.deviceId || 'ESP01';

  if (!systemState[deviceId]) {
    return res.status(400).json({ error: `Invalid device ID '${deviceId}'. Supported devices: ESP01, ESP02` });
  }

  const dev = systemState[deviceId];
  dev.lastSeen = Date.now();
  dev.status = 'online';

  if (data.dht_raw !== undefined) dev.dht_raw = parseFloat(data.dht_raw);
  if (data.dht_calibrated !== undefined) dev.dht_calibrated = parseFloat(data.dht_calibrated);
  if (data.ds18b20_raw !== undefined) dev.ds18b20_raw = parseFloat(data.ds18b20_raw);
  if (data.ds18b20_calibrated !== undefined) dev.ds18b20_calibrated = parseFloat(data.ds18b20_calibrated);

  if (data.difference !== undefined) {
    dev.difference = parseFloat(data.difference);
  } else {
    dev.difference = Number(Math.abs(dev.dht_calibrated - dev.ds18b20_calibrated).toFixed(2));
  }

  if (data.fused_temperature !== undefined) {
    dev.fused_temperature = parseFloat(data.fused_temperature);
  } else {
    const w1 = dev.kalman_details.k_dht;
    const w2 = dev.kalman_details.k_ds18;
    dev.fused_temperature = Number((w1 * dev.dht_calibrated + w2 * dev.ds18b20_calibrated).toFixed(2));
  }

  if (data.latitude !== undefined && data.longitude !== undefined) {
    dev.gps.latitude = parseFloat(data.latitude);
    dev.gps.longitude = parseFloat(data.longitude);
    dev.gps.valid = true;
  }
  if (data.satellites !== undefined) dev.gps.satellites = parseInt(data.satellites);
  if (data.gps_status !== undefined) dev.gps.gps_status = data.gps_status;

  if (data.led1 !== undefined) dev.led1.actual_state = data.led1 === 1 || data.led1 === 'ON' ? 'ON' : 'OFF';
  if (data.led2 !== undefined) dev.led2.actual_state = data.led2 === 1 || data.led2 === 'ON' ? 'ON' : 'OFF';

  addHistoricalPoint();
  broadcastWebSocketState();

  res.json({
    success: true,
    message: `Telemetry updated for ${deviceId}`,
    deviceId,
    fused_temperature: dev.fused_temperature,
    timestamp: Date.now()
  });
});

app.post('/api/calibration', (req, res) => {
  const { deviceId, dht_slope, dht_offset, ds18_slope, ds18_offset } = req.body;
  if (systemState[deviceId]) {
    if (dht_slope !== undefined) systemState[deviceId].calibration.dht_slope = parseFloat(dht_slope);
    if (dht_offset !== undefined) systemState[deviceId].calibration.dht_offset = parseFloat(dht_offset);
    if (ds18_slope !== undefined) systemState[deviceId].calibration.ds18_slope = parseFloat(ds18_slope);
    if (ds18_offset !== undefined) systemState[deviceId].calibration.ds18_offset = parseFloat(ds18_offset);
  }
  res.json({ success: true, calibration: systemState[deviceId].calibration });
});

// Serve static frontend files from build output (dist/) AFTER API routes
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback: Serve index.html for non-API routes (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
    if (err) next();
  });
});

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastWebSocketState() {
  const packet = JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    timestamp: Date.now(),
    mqttConnected: isMqttConnected,
    devices: systemState,
    alarms: activeAlarms
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(packet);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('📡 Client connected to WebSocket SCADA Stream');
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    devices: systemState,
    alarms: activeAlarms,
    history: historicalLogs.slice(-50),
    mqttConnected: isMqttConnected
  }));
});

connectMqtt();

server.listen(PORT, () => {
  console.log(`🚀 SCADA Backend Server listening on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Stream available at ws://localhost:${PORT}/ws`);
});
