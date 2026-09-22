import { create } from 'zustand';

// Initial state for two devices based on prompt
const initialDevices = {
  ESP01: {
    id: "ESP01",
    status: "offline", // 'online' or 'offline'
    temperature: {
      dht22: null,
      ds18b20: null,
      fused: null
    },
    gps: {
      latitude: null,
      longitude: null,
      valid: false
    },
    led: {
      state: "UNKNOWN" // 'ON', 'OFF', 'UNKNOWN', 'COMMAND SENT'
    },
    lastUpdate: null,
  },
  ESP02: {
    id: "ESP02",
    status: "offline",
    temperature: {
      dht22: null,
      ds18b20: null,
      fused: null
    },
    gps: {
      latitude: null,
      longitude: null,
      valid: false
    },
    led: {
      state: "UNKNOWN"
    },
    lastUpdate: null,
  }
};

const useDeviceStore = create((set) => ({
  devices: initialDevices,
  
  updateDeviceTemperature: (id, temps) => set((state) => {
    if (!state.devices[id]) return state;
    return {
      devices: {
        ...state.devices,
        [id]: {
          ...state.devices[id],
          status: "online",
          lastUpdate: Date.now(),
          temperature: {
            ...state.devices[id].temperature,
            ...temps
          }
        }
      }
    };
  }),

  updateDeviceGps: (id, gps) => set((state) => {
    if (!state.devices[id]) return state;
    return {
      devices: {
        ...state.devices,
        [id]: {
          ...state.devices[id],
          status: "online",
          lastUpdate: Date.now(),
          gps: {
            ...state.devices[id].gps,
            ...gps
          }
        }
      }
    };
  }),

  updateLedState: (id, ledState) => set((state) => {
    if (!state.devices[id]) return state;
    return {
      devices: {
        ...state.devices,
        [id]: {
          ...state.devices[id],
          led: { state: ledState }
        }
      }
    };
  }),

  setDeviceStatus: (id, status) => set((state) => {
    if (!state.devices[id]) return state;
    return {
      devices: {
        ...state.devices,
        [id]: {
          ...state.devices[id],
          status
        }
      }
    };
  })
}));

export default useDeviceStore;
