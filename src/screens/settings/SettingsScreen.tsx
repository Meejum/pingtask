import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

export default function SettingsScreen() {
  const colors = useThemeStore((s) => s.colors);
  const themeToggle = useThemeStore((s) => s.toggle);
  const themeMode = useThemeStore((s) => s.mode);
  const user = useAuthStore((s) => s.user);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {user && (
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user.displayName || 'No name set'}
          </Text>
          <Text style={[styles.pin, { color: colors.accentLight }]}>
            PIN: {user.pin}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.item, { borderBottomColor: colors.border }]}
        onPress={themeToggle}
      >
        <Text style={{ color: colors.text, fontSize: typography.fontSize.lg }}>
          Theme: {themeMode === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: colors.error }]}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding },
  profileCard: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xxxl,
  },
  name: { fontSize: typography.fontSize.xl, fontWeight: '700', marginBottom: spacing.xs },
  pin: { fontSize: typography.fontSize.lg, fontWeight: '600', letterSpacing: 2 },
  item: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  signOutButton: {
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
});
