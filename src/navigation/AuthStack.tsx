import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { useAuthStore, useThemeStore } from '../stores';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SetProfileScreen from '../screens/auth/SetProfileScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const colors = useThemeStore((s) => s.colors);
  const needsProfile = useAuthStore((s) => s.needsProfile);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {needsProfile ? (
        <Stack.Screen
          name="SetProfile"
          component={SetProfileScreen}
          options={{ title: 'Set Up Profile', headerBackVisible: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: 'Sign In' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
