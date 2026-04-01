import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { loadSettings, saveSettings, UserSettings } from '../../services/settingsService';
import { LoadingScreen } from '../../components/common';

type Visibility = 'everyone' | 'contacts' | 'nobody';

export default function PrivacyScreen() {
  const colors = useThemeStore((s) => s.colors);
  const uid = useAuthStore((s) => s.user?.uid);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (!uid) return;
    loadSettings(uid).then(setSettings);
  }, [uid]);

  const updateVisibility = (key: keyof UserSettings, current: Visibility) => {
    if (!uid || !settings) return;
    const order: Visibility[] = ['everyone', 'contacts', 'nobody'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    const updated = { ...settings, [key]: next };
    setSettings(updated as UserSettings);
    saveSettings(uid, { [key]: next });
  };

  const updateToggle = (key: keyof UserSettings, val: boolean) => {
    if (!uid || !settings) return;
    const updated = { ...settings, [key]: val };
    setSettings(updated as UserSettings);
    saveSettings(uid, { [key]: val });
  };

  if (!settings) return <LoadingScreen />;

  const displayValue = (v: Visibility) =>
    v === 'everyone' ? 'Everyone' : v === 'contacts' ? 'My Contacts' : 'Nobody';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile Visibility</Text>
      <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
        Control who can see your information
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {([
          { key: 'lastSeenVisibility' as const, label: 'Last Seen' },
          { key: 'profilePhotoVisibility' as const, label: 'Profile Photo' },
          { key: 'statusVisibility' as const, label: 'Status' },
        ]).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, { borderBottomColor: colors.borderLight }]}
            onPress={() => updateVisibility(item.key, settings[item.key] as Visibility)}
            activeOpacity={0.6}
          >
            <View style={styles.itemContent}>
              <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
            <Text style={[styles.itemValue, { color: colors.textTertiary }]}>
              {displayValue(settings[item.key] as Visibility)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Chat Privacy</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.item, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Read Receipts</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Others can see when you've read their messages
            </Text>
          </View>
          <Switch
            value={settings.readReceipts}
            onValueChange={(v) => updateToggle('readReceipts', v)}
            trackColor={{ true: colors.accentLight, false: colors.surfaceVariant }}
          />
        </View>
        <View style={[styles.item, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Typing Indicator</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
              Others can see when you're typing
            </Text>
          </View>
          <Switch
            value={settings.typingIndicator}
            onValueChange={(v) => updateToggle('typingIndicator', v)}
            trackColor={{ true: colors.accentLight, false: colors.surfaceVariant }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Blocked Users</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyBlocked}>
          <Ionicons name="ban-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No blocked users</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginLeft: spacing.xs },
  sectionDesc: { fontSize: typography.fontSize.sm, marginBottom: spacing.md, marginLeft: spacing.xs },
  section: { borderRadius: layout.borderRadius.lg, marginBottom: spacing.xxl, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  itemContent: { flex: 1 },
  itemLabel: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
  itemSub: { fontSize: typography.fontSize.xs, marginTop: 2 },
  itemValue: { fontSize: typography.fontSize.md },
  emptyBlocked: { padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  emptyText: { fontSize: typography.fontSize.md },
});
