import { create } from 'zustand';

const initialDevices = {
  ESP01: {
    deviceId: "ESP01",
    status: "online",
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
    deviceId: "ESP02",
    status: "online",
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

const useDeviceStore = create((set) => ({
  devices: initialDevices,
  selectedDevice: 'ALL', // 'ALL', 'ESP01', 'ESP02'
  activeView: 'overview', // 'overview', 'live', 'fusion', 'calibration', 'gps', 'led', 'alarms', 'history', 'system'
  backendConnected: false,
  mqttConnected: false,

  setSelectedDevice: (deviceId) => set({ selectedDevice: deviceId }),
  setActiveView: (view) => set({ activeView: view }),
  setBackendConnected: (status) => set({ backendConnected: status }),
  setMqttConnected: (status) => set({ mqttConnected: status }),

  updateAllDevices: (newDevices) => set((state) => ({
    devices: {
      ...state.devices,
      ...newDevices
    }
  }))
}));

export default useDeviceStore;
