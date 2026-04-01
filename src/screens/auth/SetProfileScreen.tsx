import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout, config } from '../../constants';
import { Button, Input, LoadingScreen } from '../../components/common';
import {
  getCurrentUid,
  subscribeToUserDoc,
  setDisplayName,
} from '../../services/authService';

export default function SetProfileScreen() {
  const colors = useThemeStore((s) => s.colors);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForPin, setWaitingForPin] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const uid = getCurrentUid();
    if (!uid) return;

    const unsubscribe = subscribeToUserDoc(uid, (generatedPin) => {
      setPin(generatedPin);
      setWaitingForPin(false);
    });

    return unsubscribe;
  }, []);

  const handleContinue = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Please enter your display name');
      return;
    }

    const uid = getCurrentUid();
    if (!uid) return;

    setLoading(true);
    setError('');
    try {
      const userData = await setDisplayName(uid, trimmed);
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (waitingForPin) {
    return <LoadingScreen message="Generating your unique PIN..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Set Up Profile</Text>

      <View style={[styles.pinBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>
          Your PIN
        </Text>
        <Text style={[styles.pinValue, { color: colors.accentLight }]}>
          {pin}
        </Text>
        <Text style={[styles.pinHint, { color: colors.textTertiary }]}>
          Share this PIN so others can add you
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          placeholder="Display Name"
          value={displayName}
          onChangeText={(t) => {
            setName(t);
            if (error) setError('');
          }}
          maxLength={config.MAX_DISPLAY_NAME_LENGTH}
          error={error}
          onSubmitEditing={handleContinue}
        />
      </View>

      <Button title="Continue" onPress={handleContinue} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: layout.screenPadding,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxl,
  },
  pinBox: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  pinLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  pinValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  pinHint: {
    fontSize: typography.fontSize.xs,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
});
