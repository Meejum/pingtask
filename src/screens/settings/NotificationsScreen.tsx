import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { loadSettings, saveSettings, UserSettings } from '../../services/settingsService';
import { LoadingScreen } from '../../components/common';

interface ToggleItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

function ToggleItem({ icon, label, subtitle, value, onToggle }: ToggleItemProps) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View style={[styles.item, { borderBottomColor: colors.borderLight }]}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.itemSub, { color: colors.textTertiary }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: colors.accentLight, false: colors.surfaceVariant }}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const colors = useThemeStore((s) => s.colors);
  const uid = useAuthStore((s) => s.user?.uid);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (!uid) return;
    loadSettings(uid).then(setSettings);
  }, [uid]);

  const update = (key: keyof UserSettings, val: boolean) => {
    if (!uid || !settings) return;
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSettings(uid, { [key]: val });
  };

  if (!settings) return <LoadingScreen />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Push Notifications</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem icon="chatbubble-outline" label="Messages" subtitle="New messages and replies" value={settings.pushMessages} onToggle={(v) => update('pushMessages', v)} />
        <ToggleItem icon="checkbox-outline" label="Task Assignments" subtitle="When someone assigns you a task" value={settings.pushTasks} onToggle={(v) => update('pushTasks', v)} />
        <ToggleItem icon="person-add-outline" label="Contact Requests" subtitle="When someone adds you" value={settings.pushContacts} onToggle={(v) => update('pushContacts', v)} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Email</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem icon="mail-outline" label="Weekly Digest" subtitle="Summary of your tasks and messages" value={settings.emailDigest} onToggle={(v) => update('emailDigest', v)} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sounds & Haptics</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem icon="volume-high-outline" label="Notification Sounds" subtitle="Play sound for new messages" value={settings.sounds} onToggle={(v) => update('sounds', v)} />
        <ToggleItem icon="phone-portrait-outline" label="Vibration" subtitle="Vibrate on notifications" value={settings.vibrate} onToggle={(v) => update('vibrate', v)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
  section: { borderRadius: layout.borderRadius.lg, marginBottom: spacing.xxl, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  itemContent: { flex: 1 },
  itemLabel: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
  itemSub: { fontSize: typography.fontSize.xs, marginTop: 2 },
});
