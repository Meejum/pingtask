import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

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
  const [pushMessages, setPushMessages] = useState(true);
  const [pushTasks, setPushTasks] = useState(true);
  const [pushContacts, setPushContacts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Push Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Push Notifications</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem
          icon="chatbubble-outline"
          label="Messages"
          subtitle="New messages and replies"
          value={pushMessages}
          onToggle={setPushMessages}
        />
        <ToggleItem
          icon="checkbox-outline"
          label="Task Assignments"
          subtitle="When someone assigns you a task"
          value={pushTasks}
          onToggle={setPushTasks}
        />
        <ToggleItem
          icon="person-add-outline"
          label="Contact Requests"
          subtitle="When someone adds you"
          value={pushContacts}
          onToggle={setPushContacts}
        />
      </View>

      {/* Email */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Email</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem
          icon="mail-outline"
          label="Weekly Digest"
          subtitle="Summary of your tasks and messages"
          value={emailDigest}
          onToggle={setEmailDigest}
        />
      </View>

      {/* Sounds & Haptics */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sounds & Haptics</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ToggleItem
          icon="volume-high-outline"
          label="Notification Sounds"
          subtitle="Play sound for new messages"
          value={sounds}
          onToggle={setSounds}
        />
        <ToggleItem
          icon="phone-portrait-outline"
          label="Vibration"
          subtitle="Vibrate on notifications"
          value={vibrate}
          onToggle={setVibrate}
        />
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
});
