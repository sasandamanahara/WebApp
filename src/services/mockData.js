import useDeviceStore from '../store/deviceStore';
import useHistoryStore from '../store/historyStore';
import useMqttStore from '../store/mqttStore';
import useAlarmStore from '../store/alarmStore';

let intervalId = null;

// Base coordinates roughly in Sri Lanka
const BASE_LAT = 7.2906;
const BASE_LNG = 80.6337;

// Generate slight random variations
const randomTemp = (base) => base + (Math.random() * 2 - 1);
const randomCoord = (base) => base + (Math.random() * 0.001 - 0.0005);

export const startDemoData = () => {
  const mqttStore = useMqttStore.getState();
  mqttStore.setDemoMode(true);
  mqttStore.setConnected(false);

  // Initial dummy GPS
  useDeviceStore.getState().updateDeviceGps('ESP01', { latitude: BASE_LAT + 0.01, longitude: BASE_LNG, valid: true });
  useDeviceStore.getState().updateDeviceGps('ESP02', { latitude: BASE_LAT, longitude: BASE_LNG + 0.01, valid: true });

  intervalId = setInterval(() => {
    const timestamp = Date.now();
    
    // Simulate ESP01 temps
    const esp01_dht = randomTemp(28);
    const esp01_ds18 = randomTemp(27.8);
    // Simple mock kalman fusion average
    const esp01_fused = (esp01_dht * 0.4) + (esp01_ds18 * 0.6);
    
    // Simulate ESP02 temps
    const esp02_dht = randomTemp(26.5);
    const esp02_ds18 = randomTemp(26.3);
    const esp02_fused = (esp02_dht * 0.4) + (esp02_ds18 * 0.6);

    const deviceStore = useDeviceStore.getState();
    const alarmStore = useAlarmStore.getState();

    deviceStore.updateDeviceTemperature('ESP01', {
      dht22: parseFloat(esp01_dht.toFixed(2)),
      ds18b20: parseFloat(esp01_ds18.toFixed(2)),
      fused: parseFloat(esp01_fused.toFixed(2))
    });

    deviceStore.updateDeviceTemperature('ESP02', {
      dht22: parseFloat(esp02_dht.toFixed(2)),
      ds18b20: parseFloat(esp02_ds18.toFixed(2)),
      fused: parseFloat(esp02_fused.toFixed(2))
    });

    // Move GPS slightly
    deviceStore.updateDeviceGps('ESP01', { latitude: randomCoord(BASE_LAT + 0.01), longitude: randomCoord(BASE_LNG), valid: true });
    
    // Add to history
    useHistoryStore.getState().addDataPoint({
      timestamp,
      esp01_fused: parseFloat(esp01_fused.toFixed(2)),
      esp01_dht: parseFloat(esp01_dht.toFixed(2)),
      esp01_ds18: parseFloat(esp01_ds18.toFixed(2)),
      esp02_fused: parseFloat(esp02_fused.toFixed(2)),
      esp02_dht: parseFloat(esp02_dht.toFixed(2)),
      esp02_ds18: parseFloat(esp02_ds18.toFixed(2)),
    });

    // Check Alarms
    if (esp01_fused > alarmStore.threshold) {
      alarmStore.addAlarm({
        device: 'ESP01',
        type: 'High Temperature',
        temperature: esp01_fused,
        threshold: alarmStore.threshold,
        priority: 'HIGH'
      });
    }

  }, 2000); // 2 seconds update rate
};

export const stopDemoData = () => {
  if (intervalId) clearInterval(intervalId);
  useMqttStore.getState().setDemoMode(false);
};

export const simulateLedCommand = (id, command) => {
  // 1. User sends command -> UI should show COMMAND SENT
  useDeviceStore.getState().updateLedState(id, 'COMMAND SENT');
  
  // 2. Simulate delay over network and actual device processing
  setTimeout(() => {
    // 3. Receive status back
    useDeviceStore.getState().updateLedState(id, command === '1' ? 'ON' : 'OFF');
  }, 1000);
};
