import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../../components/common';
import { signOut } from '../../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;
};

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  color?: string;
}

function SettingsItem({ icon, label, value, onPress, color }: SettingsItemProps) {
  const colors = useThemeStore((s) => s.colors);
  const textColor = color || colors.text;

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Ionicons name={icon} size={22} color={textColor} style={styles.itemIcon} />
      <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
      <View style={styles.itemRight}>
        {value && (
          <Text style={[styles.itemValue, { color: colors.textTertiary }]}>{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const themeToggle = useThemeStore((s) => s.toggle);
  const themeMode = useThemeStore((s) => s.mode);
  const user = useAuthStore((s) => s.user);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
      <TouchableOpacity
        style={[styles.profileCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        <Avatar
          uri={user?.avatarUrl}
          name={user?.displayName || ''}
          size="xl"
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.displayName || 'No name set'}
          </Text>
          <Text style={[styles.profileStatus, { color: colors.textSecondary }]}>
            {user?.statusMessage || user?.status || 'Available'}
          </Text>
          <Text style={[styles.profilePin, { color: colors.accentLight }]}>
            PIN: {user?.pin}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingsItem
          icon="qr-code-outline"
          label="My PIN & QR Code"
          onPress={() => navigation.navigate('MyPin')}
        />
      </View>

      {/* Preferences Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon={themeMode === 'dark' ? 'moon-outline' : 'sunny-outline'}
          label="Theme"
          value={themeMode === 'dark' ? 'Dark' : 'Light'}
          onPress={themeToggle}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textTertiary }]}>
        PingTask v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: layout.borderRadius.lg,
    marginBottom: spacing.xxl,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  profileStatus: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  profilePin: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    borderRadius: layout.borderRadius.lg,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemValue: {
    fontSize: typography.fontSize.md,
  },
  signOutContainer: {
    marginTop: spacing.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xxl,
  },
});
