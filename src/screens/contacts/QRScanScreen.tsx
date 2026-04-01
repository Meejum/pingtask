import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContactStackParamList } from '../../types';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Button, Input } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<ContactStackParamList, 'QRScan'>;
};

export default function QRScanScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const [manualPin, setManualPin] = useState('');

  // Camera-based QR scanning requires expo-camera which needs native modules.
  // On web, we show a manual PIN entry fallback.
  // On mobile, we'll add camera scanning in a future update.

  const handleManualAdd = () => {
    if (manualPin.trim().length > 0) {
      navigation.navigate('AddContact', { pin: manualPin.trim().toUpperCase() });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Scanner Area */}
        <View style={[styles.scannerArea, { backgroundColor: colors.surface }]}>
          <View style={[styles.scanFrame, { borderColor: colors.accentLight }]}>
            <Ionicons name="scan-outline" size={80} color={colors.accentLight} />
          </View>
          <Text style={[styles.scanHint, { color: colors.textSecondary }]}>
            {Platform.OS === 'web'
              ? 'Camera scanning is available on mobile devices'
              : 'Point your camera at a PingTask QR code'}
          </Text>
        </View>

        {/* Manual Entry */}
        <View style={styles.manualSection}>
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or enter PIN manually</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.manualRow}>
            <View style={styles.inputWrap}>
              <Input
                placeholder="Enter PIN"
                value={manualPin}
                onChangeText={(t) => setManualPin(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={8}
                onSubmitEditing={handleManualAdd}
              />
            </View>
            <Button
              title="Go"
              onPress={handleManualAdd}
              disabled={manualPin.trim().length === 0}
              style={styles.goButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: layout.screenPadding },
  scannerArea: {
    flex: 1,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scanHint: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  manualSection: {
    marginBottom: spacing.xxl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: typography.fontSize.sm },
  manualRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  inputWrap: { flex: 1 },
  goButton: { minWidth: 60 },
});
