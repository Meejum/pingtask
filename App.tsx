import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useThemeStore, useAuthStore } from './src/stores';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import LockScreen from './src/components/common/LockScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import {
  isBiometricAvailable,
  getBiometricType,
  authenticateWithBiometric,
} from './src/services/biometricService';
import { loadSettings } from './src/services/settingsService';

// Deep linking configuration
const linking: LinkingOptions<any> = {
  prefixes: ['pingtask://', 'https://pingtask.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
        },
      },
      Main: {
        screens: {
          ContactTab: {
            screens: {
              AddContact: 'add/:pin',
            },
          },
          ChatTab: {
            screens: {
              ChatRoom: 'chat/:conversationId',
            },
          },
        },
      },
    },
  },
};

export default function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const uid = useAuthStore((s) => s.user?.uid);

  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check onboarding status
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const seen = localStorage.getItem('pingtask_onboarding_seen');
        if (!seen) setShowOnboarding(true);
      }
    } catch {}
    setOnboardingChecked(true);
  }, []);

  // Check if biometric lock is enabled
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

  // Lock on app background
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pingtask_onboarding_seen', 'true');
      }
    } catch {}
  };

  if (!onboardingChecked) return null;

  if (showOnboarding && !isAuthenticated) {
    return (
      <ErrorBoundary>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  if (isLocked && biometricEnabled && isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} biometricType={biometricType} />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
