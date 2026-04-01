import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout, config } from '../../constants';
import { Avatar, Button, Input } from '../../components/common';
import { showAlert } from '../../utils/alert';
import { pickImage, uploadAvatar } from '../../services/mediaService';
import { UserStatus } from '../../types';

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: '#4CAF50' },
  { value: 'busy', label: 'Busy', color: '#FF9800' },
  { value: 'away', label: 'Away', color: '#9E9E9E' },
];

export default function EditProfileScreen() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'available');
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const hasChanges =
    displayName !== (user?.displayName || '') ||
    phone !== (user?.phoneNumber || '') ||
    statusMessage !== (user?.statusMessage || '') ||
    status !== (user?.status || 'available');

  const handleSave = async () => {
    if (!displayName.trim()) {
      showAlert('Error', 'Display name cannot be empty');
      return;
    }
    if (!user?.uid) return;

    setSaving(true);
    try {
      const updates: Record<string, any> = {
        displayName: displayName.trim(),
        phoneNumber: phone.trim() || null,
        statusMessage: statusMessage.trim(),
        status,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'users', user.uid), updates);
      setUser({
        ...user,
        displayName: displayName.trim(),
        phoneNumber: phone.trim() || null,
        statusMessage: statusMessage.trim(),
        status,
      });
      showAlert('Saved', 'Profile updated successfully');
    } catch (error: any) {
      showAlert('Error', error.message);
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
        <Avatar uri={avatarUri} name={displayName} size="xxl" />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={async () => {
            const uri = await pickImage();
            if (!uri || !user?.uid) return;
            setAvatarUri(uri);
            setUploadingAvatar(true);
            try {
              const url = await uploadAvatar(user.uid, uri);
              setAvatarUri(url);
              setUser({ ...user, avatarUrl: url });
            } catch (e: any) {
              showAlert('Error', e.message);
              setAvatarUri(user.avatarUrl);
            } finally {
              setUploadingAvatar(false);
            }
          }}
        >
          <View style={[styles.cameraBadge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            const uri = await pickImage();
            if (!uri || !user?.uid) return;
            setAvatarUri(uri);
            setUploadingAvatar(true);
            try {
              const url = await uploadAvatar(user.uid, uri);
              setAvatarUri(url);
              setUser({ ...user, avatarUrl: url });
            } catch (e: any) {
              showAlert('Error', e.message);
              setAvatarUri(user.avatarUrl);
            } finally {
              setUploadingAvatar(false);
            }
          }}
        >
          <Text style={[styles.changePhotoText, { color: colors.accentLight }]}>
            {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personal Info */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Personal Information</Text>
      <View style={styles.form}>
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={config.MAX_DISPLAY_NAME_LENGTH}
          placeholder="Your name"
        />
        <Input
          label="Email"
          value={email}
          editable={false}
          placeholder="Email address"
          keyboardType="email-address"
        />
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+971 50 123 4567"
          keyboardType="phone-pad"
        />
      </View>

      {/* Status */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Status</Text>
      <View style={styles.form}>
        <Input
          label="Status Message"
          value={statusMessage}
          onChangeText={setStatusMessage}
          maxLength={config.MAX_STATUS_LENGTH}
          placeholder="What's on your mind?"
        />
      </View>

      <View style={[styles.statusSection, { backgroundColor: colors.surface }]}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.statusOption, { borderBottomColor: colors.borderLight }]}
            onPress={() => setStatus(opt.value)}
            activeOpacity={0.6}
          >
            <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
            <Text style={[styles.statusLabel, { color: colors.text }]}>{opt.label}</Text>
            {status === opt.value && (
              <Ionicons name="checkmark-circle" size={22} color={colors.accentLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>

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
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    top: 56,
    right: '35%',
  },
  cameraBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
  },
});
