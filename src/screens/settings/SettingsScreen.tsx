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
  subtitle?: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

function SettingsItem({ icon, label, subtitle, onPress, color, showChevron = true }: SettingsItemProps) {
  const colors = useThemeStore((s) => s.colors);
  const textColor = color || colors.text;

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.itemIconWrap, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon} size={18} color={textColor} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.itemSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
        )}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
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
        <Avatar uri={user?.avatarUrl} name={user?.displayName || ''} size="xl" />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.displayName || 'No name set'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {user?.email || ''}
          </Text>
          <Text style={[styles.profilePin, { color: colors.accentLight }]}>
            PIN: {user?.pin}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Account / Profile */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon="person-outline"
          label="Profile Info"
          subtitle="Name, email, phone, avatar"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingsItem
          icon="qr-code-outline"
          label="My PIN & QR Code"
          subtitle="Share your unique PIN"
          onPress={() => navigation.navigate('MyPin')}
        />
        <SettingsItem
          icon="lock-closed-outline"
          label="Login & Security"
          subtitle="Password, PIN, two-factor auth"
          onPress={() => navigation.navigate('Security')}
        />
        <SettingsItem
          icon="server-outline"
          label="Data Management"
          subtitle="Export, delete, or deactivate"
          onPress={() => navigation.navigate('DataManagement')}
        />
      </View>

      {/* App / General */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Settings</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon="color-palette-outline"
          label="Appearance"
          subtitle="Theme, colors, display"
          onPress={() => navigation.navigate('Appearance')}
        />
        <SettingsItem
          icon="notifications-outline"
          label="Notifications"
          subtitle="Push, email, and sound preferences"
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {/* Privacy */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Privacy</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon="eye-outline"
          label="Privacy & Visibility"
          subtitle="Who can see your profile and status"
          onPress={() => navigation.navigate('Privacy')}
        />
      </View>

      {/* Support & About */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsItem
          icon="help-circle-outline"
          label="Help & Support"
          subtitle="FAQs, contact us, report a bug"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <SettingsItem
          icon="information-circle-outline"
          label="About"
          subtitle="Version, terms, privacy policy"
          onPress={() => navigation.navigate('About')}
        />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: colors.error }]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

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
  profileEmail: {
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
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
