import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore, useThemeStore } from '../stores';
import { subscribeToAuth } from '../services/authService';
import { LoadingScreen } from '../components/common';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, setUser, setNeedsProfile, setLoading } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth(
      (user) => setUser(user),
      (_uid) => setNeedsProfile(true),
      (loading) => setLoading(loading),
    );
    return unsubscribe;
  }, [setUser, setNeedsProfile, setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
