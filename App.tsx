import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useThemeStore, useAuthStore } from './src/stores';
import LockScreen from './src/components/common/LockScreen';
import {
  isBiometricAvailable,
  getBiometricType,
  authenticateWithBiometric,
} from './src/services/biometricService';
import { loadSettings } from './src/services/settingsService';

export default function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const uid = useAuthStore((s) => s.user?.uid);

  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const appState = useRef(AppState.currentState);

  // Check if biometric lock is enabled in settings
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const available = await isBiometricAvailable();
      if (!available) return;

      const settings = await loadSettings(uid);
      if ((settings as any).biometricLock) {
        setBiometricEnabled(true);
        const type = await getBiometricType();
        setBiometricType(type);
      }
    })();
  }, [uid]);

  // Lock on app background, unlock with biometric on foreground
  useEffect(() => {
    if (!biometricEnabled || !isAuthenticated) return;

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next.match(/inactive|background/)) {
        setIsLocked(true);
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [biometricEnabled, isAuthenticated]);

  const handleUnlock = async () => {
    const success = await authenticateWithBiometric('Unlock PingTask');
    if (success) setIsLocked(false);
  };

  if (isLocked && biometricEnabled && isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} biometricType={biometricType} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
