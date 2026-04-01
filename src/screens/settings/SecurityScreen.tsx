import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Button, Input } from '../../components/common';

export default function SecurityScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) return;

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Password */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Password</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {!showPasswordForm ? (
          <TouchableOpacity
            style={styles.item}
            onPress={() => setShowPasswordForm(true)}
            activeOpacity={0.6}
          >
            <Ionicons name="key-outline" size={20} color={colors.text} />
            <View style={styles.itemContent}>
              <Text style={[styles.itemLabel, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
                Last changed: Unknown
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.passwordForm}>
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter new password"
            />
            <View style={styles.passwordActions}>
              <Button title="Update Password" onPress={handleChangePassword} loading={saving} />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Two-Factor Authentication */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Two-Factor Authentication</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.item}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Enable 2FA</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Add extra security to your account
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={(val) => {
              Alert.alert('Coming Soon', '2FA will be available in a future update');
            }}
            trackColor={{ true: colors.accentLight, false: colors.surfaceVariant }}
          />
        </View>
      </View>

      {/* Active Sessions */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sessions</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.item}>
          <Ionicons name="phone-portrait-outline" size={20} color={colors.online} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Current Device</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>Active now</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: colors.online }]}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  itemContent: { flex: 1 },
  itemLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  itemSub: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  passwordForm: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  passwordActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: layout.borderRadius.full,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
