import { create } from 'zustand';

const useAlarmStore = create((set) => ({
  alarms: [],
  threshold: 30.0, // Configurable threshold for high temp
  
  setThreshold: (val) => set({ threshold: val }),
  
  addAlarm: (alarm) => set((state) => ({
    // prepend new alarm
    alarms: [
      {
        id: Date.now().toString() + Math.random().toString(),
        timestamp: Date.now(),
        status: 'ACTIVE',
        ...alarm
      },
      ...state.alarms
    ]
  })),

  acknowledgeAlarm: (id) => set((state) => ({
    alarms: state.alarms.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)
  })),
  
  clearAlarms: () => set({ alarms: [] })
}));

export default useAlarmStore;
