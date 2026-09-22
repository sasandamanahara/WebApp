import { create } from 'zustand';

// We store history as an array of objects
// { timestamp: ms, esp01_fused: val, esp02_fused: val, ... }
const useHistoryStore = create((set, get) => ({
  history: [],
  maxPoints: 100, // Maximum points to keep in memory for the chart to avoid memory leaks
  
  addDataPoint: (point) => set((state) => {
    const newHistory = [...state.history, point];
    if (newHistory.length > state.maxPoints) {
      newHistory.shift(); // Remove oldest
    }
    return { history: newHistory };
  })
}));

export default useHistoryStore;
