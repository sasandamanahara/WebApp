import { create } from 'zustand';

const useMqttStore = create((set) => ({
  connected: false,
  demoMode: false,
  error: null,
  
  setConnected: (status) => set({ connected: status, error: null }),
  setDemoMode: (status) => set({ demoMode: status }),
  setError: (error) => set({ error, connected: false }),
}));

export default useMqttStore;
