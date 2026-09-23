import { create } from 'zustand';

const initialAlarms = [
  {
    id: 1,
    deviceId: 'ESP01',
    type: 'System Notice',
    severity: 'INFO',
    message: 'ESP01 Node connected to MQTT broker (10.15.0.3:1883)',
    timestamp: Date.now() - 120000,
    acknowledged: true
  },
  {
    id: 2,
    deviceId: 'ESP02',
    type: 'GPS Fix Acquired',
    severity: 'INFO',
    message: 'ESP02 acquired 3D GNSS Satellite Fix (11 satellites)',
    timestamp: Date.now() - 60000,
    acknowledged: true
  }
];

const useAlarmStore = create((set) => ({
  alarms: initialAlarms,
  highTempThreshold: 32.0,
  mismatchThreshold: 1.5,

  setHighTempThreshold: (val) => set({ highTempThreshold: val }),
  setMismatchThreshold: (val) => set({ mismatchThreshold: val }),

  setAlarms: (newAlarms) => set({ alarms: newAlarms }),

  addAlarm: (alarm) => set((state) => ({
    alarms: [alarm, ...state.alarms].slice(0, 100)
  })),

  ackAlarm: (id) => set((state) => ({
    alarms: state.alarms.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  }))
}));

export default useAlarmStore;
