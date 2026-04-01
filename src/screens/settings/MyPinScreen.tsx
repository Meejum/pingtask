import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { showAlert } from '../../utils/alert';

export default function MyPinScreen() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const pin = user?.pin || '';
  const qrValue = `pingtask://add/${pin}`;

  const copyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      showAlert('Copied', 'PIN copied to clipboard');
    } catch {
      showAlert('Your PIN', pin);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* PIN Display */}
        <View style={[styles.pinCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>
            Your Unique PIN
          </Text>
          <Text style={[styles.pinValue, { color: colors.accentLight }]}>
            {pin}
          </Text>
          <Text style={[styles.pinHint, { color: colors.textTertiary }]}>
            Share this PIN so others can find and add you
          </Text>

          <TouchableOpacity
            style={[styles.copyButton, { borderColor: colors.accentLight }]}
            onPress={copyPin}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={18} color={colors.accentLight} />
            <Text style={[styles.copyText, { color: colors.accentLight }]}>
              Copy PIN
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        <View style={[styles.qrCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.qrTitle, { color: colors.text }]}>Your QR Code</Text>
          <View style={[styles.qrWrapper, { backgroundColor: '#FFFFFF' }]}>
            <QRCode
              value={qrValue}
              size={180}
              color="#1A1A2E"
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={[styles.qrHint, { color: colors.textTertiary }]}>
            Others can scan this to add you instantly
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionRow}>
            <Ionicons name="person-add-outline" size={20} color={colors.accentLight} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Others can add you by entering your PIN or scanning your QR code
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accentLight} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Your PIN is unique and cannot be changed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding },
  pinCard: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  pinLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  pinValue: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 6,
    marginBottom: spacing.sm,
  },
  pinHint: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xl,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: layout.borderRadius.full,
    borderWidth: 1.5,
  },
  copyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  qrCard: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  qrTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  qrWrapper: {
    padding: spacing.lg,
    borderRadius: layout.borderRadius.md,
    marginBottom: spacing.md,
  },
  qrHint: {
    fontSize: typography.fontSize.sm,
  },
  instructions: {
    gap: spacing.lg,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
});
