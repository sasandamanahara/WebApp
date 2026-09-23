import useDeviceStore from '../store/deviceStore';
import useHistoryStore from '../store/historyStore';
import useAlarmStore from '../store/alarmStore';

let socket = null;
let reconnectTimer = null;

export const initWebSocketClient = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('⚡ Connected to SCADA Backend WebSocket');
      useDeviceStore.getState().setBackendConnected(true);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'INITIAL_STATE' || message.type === 'TELEMETRY_UPDATE') {
          if (message.devices) {
            useDeviceStore.getState().updateAllDevices(message.devices);
          }
          if (message.mqttConnected !== undefined) {
            useDeviceStore.getState().setMqttConnected(message.mqttConnected);
          }
          if (message.alarms) {
            useAlarmStore.getState().setAlarms(message.alarms);
          }
          if (message.history && Array.isArray(message.history)) {
            useHistoryStore.getState().setInitialHistory(message.history);
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      useDeviceStore.getState().setBackendConnected(false);
    };

    socket.onclose = () => {
      console.log('Disconnected from SCADA WebSocket stream. Reconnecting in 3s...');
      useDeviceStore.getState().setBackendConnected(false);
      reconnectTimer = setTimeout(() => {
        initWebSocketClient();
      }, 3000);
    };
  } catch (e) {
    console.error('Failed to create WebSocket:', e);
  }
};

export const sendLedCommand = async (deviceId, ledNum, command) => {
  try {
    const response = await fetch('/api/led', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, ledNum, command })
    });
    return await response.json();
  } catch (err) {
    console.error('Error sending LED command:', err);
    throw err;
  }
};

export const updateCalibration = async (deviceId, calibrationData) => {
  try {
    const response = await fetch('/api/calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, ...calibrationData })
    });
    return await response.json();
  } catch (err) {
    console.error('Error updating calibration:', err);
    throw err;
  }
};

export const acknowledgeAlarm = async (alarmId) => {
  try {
    const response = await fetch('/api/alarms/ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: alarmId })
    });
    return await response.json();
  } catch (err) {
    console.error('Error acknowledging alarm:', err);
    throw err;
  }
};
