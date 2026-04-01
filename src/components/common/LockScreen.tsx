import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography } from '../../constants';

interface LockScreenProps {
  onUnlock: () => void;
  biometricType: string;
}

export default function LockScreen({ onUnlock, biometricType }: LockScreenProps) {
  const colors = useThemeStore((s) => s.colors);
  const icon = biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={48} color={colors.accentLight} />
        <Text style={[styles.title, { color: colors.text }]}>PingTask is Locked</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Use {biometricType} to unlock
        </Text>
        <TouchableOpacity
          style={[styles.unlockBtn, { backgroundColor: colors.accentLight }]}
          onPress={onUnlock}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={24} color="#FFFFFF" />
          <Text style={styles.unlockText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 999,
    marginTop: spacing.xl,
  },
  unlockText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
