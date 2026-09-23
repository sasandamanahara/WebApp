import { create } from 'zustand';

const useHistoryStore = create((set) => ({
  history: [],
  selectedTimeRange: '5m', // '1m', '5m', '30m', '1h', '6h', '24h'

  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  setInitialHistory: (logs) => set({ history: logs }),

  addDataPoint: (point) => set((state) => {
    const newHistory = [...state.history, point];
    if (newHistory.length > 500) {
      newHistory.shift();
    }
    return { history: newHistory };
  })
}));

export default useHistoryStore;
