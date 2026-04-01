import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout, config } from '../../constants';
import { Avatar, Button, Input } from '../../components/common';
import { UserStatus } from '../../types';

const STATUS_OPTIONS: { value: UserStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'available', label: 'Available', icon: 'ellipse' },
  { value: 'busy', label: 'Busy', icon: 'ellipse' },
  { value: 'away', label: 'Away', icon: 'ellipse' },
];

export default function EditProfileScreen() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'available');
  const [saving, setSaving] = useState(false);

  const statusColor = (s: UserStatus) =>
    s === 'available' ? colors.online : s === 'busy' ? colors.busy : colors.away;

  const hasChanges =
    displayName !== (user?.displayName || '') ||
    statusMessage !== (user?.statusMessage || '') ||
    status !== (user?.status || 'available');

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        statusMessage: statusMessage.trim(),
        status,
        updatedAt: serverTimestamp(),
      });
      setUser({
        ...user,
        displayName: displayName.trim(),
        statusMessage: statusMessage.trim(),
        status,
      });
      Alert.alert('Saved', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar uri={user?.avatarUrl} name={displayName} size="xxl" />
        <TouchableOpacity style={styles.changePhotoBtn}>
          <Text style={[styles.changePhotoText, { color: colors.accentLight }]}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={config.MAX_DISPLAY_NAME_LENGTH}
          placeholder="Your name"
        />
        <Input
          label="Status Message"
          value={statusMessage}
          onChangeText={setStatusMessage}
          maxLength={config.MAX_STATUS_LENGTH}
          placeholder="What's on your mind?"
        />
      </View>

      {/* Status Selector */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Status</Text>
      <View style={[styles.statusSection, { backgroundColor: colors.surface }]}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.statusOption,
              { borderBottomColor: colors.borderLight },
            ]}
            onPress={() => setStatus(opt.value)}
            activeOpacity={0.6}
          >
            <Ionicons name={opt.icon} size={12} color={statusColor(opt.value)} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>{opt.label}</Text>
            {status === opt.value && (
              <Ionicons name="checkmark" size={20} color={colors.accentLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Save */}
      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
        disabled={!hasChanges}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  changePhotoBtn: {
    marginTop: spacing.md,
  },
  changePhotoText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  statusSection: {
    borderRadius: layout.borderRadius.lg,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  statusLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
  },
});
