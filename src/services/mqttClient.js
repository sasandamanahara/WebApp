import mqtt from 'mqtt';
import useMqttStore from '../store/mqttStore';
import useDeviceStore from '../store/deviceStore';
import useHistoryStore from '../store/historyStore';
import useAlarmStore from '../store/alarmStore';
import MQTT_TOPICS from '../utils/mqttTopics';

let client = null;

export const initMqttClient = () => {
  if (client) return; // already initialized

  const url = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://127.0.0.1:9001';
  const username = import.meta.env.VITE_MQTT_USERNAME;
  const password = import.meta.env.VITE_MQTT_PASSWORD;

  const options = {};
  if (username) options.username = username;
  if (password) options.password = password;

  try {
    client = mqtt.connect(url, options);
  } catch (error) {
    useMqttStore.getState().setError(error.message);
    return;
  }

  client.on('connect', () => {
    useMqttStore.getState().setConnected(true);
    
    // Subscribe to all topics for ESP01 and ESP02
    Object.values(MQTT_TOPICS).forEach(deviceTopics => {
      Object.values(deviceTopics).forEach(topic => {
        client.subscribe(topic);
      });
    });
  });

  client.on('error', (err) => {
    useMqttStore.getState().setError(err.message);
  });

  client.on('close', () => {
    useMqttStore.getState().setConnected(false);
  });

  client.on('message', (topic, message) => {
    const payload = message.toString();
    const deviceStore = useDeviceStore.getState();
    const alarmStore = useAlarmStore.getState();
    const historyStore = useHistoryStore.getState();
    
    // Identify which device this message is for
    let deviceId = null;
    if (topic.includes('ESP01')) deviceId = 'ESP01';
    else if (topic.includes('ESP02')) deviceId = 'ESP02';
    
    if (!deviceId) return;

    const topics = MQTT_TOPICS[deviceId];

    if (topic === topics.temperature) {
      try {
        // ESP32 sends a raw float string, e.g., "27.42"
        const fusedTemp = parseFloat(payload);
        
        if (isNaN(fusedTemp)) return;

        deviceStore.updateDeviceTemperature(deviceId, {
          dht22: null,   // ESP32 code only publishes the fused temperature
          ds18b20: null, // ESP32 code only publishes the fused temperature
          fused: fusedTemp
        });

        // Track History
        const currentHistory = historyStore.history;
        const lastPoint = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : {};
        const timestamp = Date.now();
        
        // Ensure we group points around the same time (~1 second) or create new
        if (lastPoint.timestamp && (timestamp - lastPoint.timestamp < 1500)) {
           // update existing point
           const updatedPoint = {
             ...lastPoint,
             [`${deviceId.toLowerCase()}_fused`]: fusedTemp,
           };
           // Replace last item
           useHistoryStore.setState({ history: [...currentHistory.slice(0, -1), updatedPoint] });
        } else {
           // create new point
           historyStore.addDataPoint({
             timestamp,
             [`${deviceId.toLowerCase()}_fused`]: fusedTemp,
           });
        }

        // Check Alarm
        if (fusedTemp > alarmStore.threshold) {
           alarmStore.addAlarm({
             device: deviceId,
             type: 'High Temperature',
             temperature: fusedTemp,
             threshold: alarmStore.threshold,
             priority: 'HIGH'
           });
        }

      } catch (e) {
        console.error("Failed to parse temperature payload", e);
      }
    } 
    else if (topic === topics.gps) {
      try {
        // ESP32 sends a raw string "lat,lng" or "Searching..."
        if (payload.includes("Searching")) {
           deviceStore.updateDeviceGps(deviceId, { valid: false });
           return;
        }

        const parts = payload.split(",");
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            deviceStore.updateDeviceGps(deviceId, {
              latitude: lat,
              longitude: lng,
              valid: true
            });
          }
        }
      } catch (e) {
        console.error("Failed to parse gps payload", e);
      }
    }
    else if (topic === topics.ledStatus) {
      // payload expects '1' for ON, '0' for OFF or similar state string
      let state = payload === '1' ? 'ON' : (payload === '0' ? 'OFF' : payload);
      deviceStore.updateLedState(deviceId, state);
    }
    else if (topic === topics.status) {
      deviceStore.setDeviceStatus(deviceId, payload.toLowerCase() === 'online' ? 'online' : 'offline');
    }
  });
};

export const disconnectMqttClient = () => {
  if (client) {
    client.end();
    client = null;
  }
};

export const publishLedCommand = (deviceId, command) => {
  if (client && client.connected) {
    const topic = MQTT_TOPICS[deviceId].ledCommand;
    // Set intermediate state
    useDeviceStore.getState().updateLedState(deviceId, 'COMMAND SENT');
    client.publish(topic, command.toString());
  }
};
