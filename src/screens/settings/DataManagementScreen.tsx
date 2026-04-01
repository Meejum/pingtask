import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { showAlert } from '../../utils/alert';

export default function DataManagementScreen() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);

  const handleExport = () => {
    showAlert(
      'Export Data',
      'We will prepare a download of all your data including messages, contacts, and tasks. You will be notified when it is ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Export', onPress: () => showAlert('Coming Soon', 'Data export will be available in a future update') },
      ],
    );
  };

  const handleDeactivate = () => {
    showAlert(
      'Deactivate Account',
      'Your account will be hidden and you will be signed out. You can reactivate by signing in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => showAlert('Coming Soon', 'Account deactivation will be available in a future update') },
      ],
    );
  };

  const handleDelete = () => {
    showAlert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: () => showAlert('Coming Soon', 'Account deletion will be available in a future update') },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Storage Info */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Storage</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.storageRow}>
          <View style={styles.storageItem}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.accentLight} />
            <Text style={[styles.storageValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.storageLabel, { color: colors.textTertiary }]}>Messages</Text>
          </View>
          <View style={styles.storageItem}>
            <Ionicons name="people-outline" size={24} color={colors.accentLight} />
            <Text style={[styles.storageValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.storageLabel, { color: colors.textTertiary }]}>Contacts</Text>
          </View>
          <View style={styles.storageItem}>
            <Ionicons name="images-outline" size={24} color={colors.accentLight} />
            <Text style={[styles.storageValue, { color: colors.text }]}>0 MB</Text>
            <Text style={[styles.storageLabel, { color: colors.textTertiary }]}>Media</Text>
          </View>
        </View>
      </View>

      {/* Export */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Export</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.item} onPress={handleExport} activeOpacity={0.6}>
          <Ionicons name="download-outline" size={20} color={colors.text} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Export My Data</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Download all your messages, contacts, and files
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.item} onPress={handleDeactivate} activeOpacity={0.6}>
          <Ionicons name="pause-circle-outline" size={20} color={colors.warning} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Deactivate Account</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Temporarily hide your profile
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <TouchableOpacity style={styles.item} onPress={handleDelete} activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.error }]}>Delete Account</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Permanently remove all your data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
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
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.xxl,
  },
  storageItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  storageValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  storageLabel: {
    fontSize: typography.fontSize.xs,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
