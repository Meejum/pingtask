import { create } from 'zustand';
import { colors, ThemeColors } from '../constants/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  colors: colors.dark,
  toggle: () =>
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      return { mode: newMode, colors: colors[newMode] };
    }),
  setMode: (mode) => set({ mode, colors: colors[mode] }),
}));
