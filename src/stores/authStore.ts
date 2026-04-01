import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsProfile: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setNeedsProfile: (needs: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  needsProfile: false,
  error: null,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      needsProfile: false,
      isLoading: false,
      error: null,
    }),
  setNeedsProfile: (needsProfile) =>
    set({ needsProfile, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      needsProfile: false,
      isLoading: false,
      error: null,
    }),
}));
