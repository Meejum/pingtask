import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

type Visibility = 'everyone' | 'contacts' | 'nobody';

interface VisibilityItemProps {
  label: string;
  value: Visibility;
  onPress: () => void;
}

function VisibilityItem({ label, value, onPress }: VisibilityItemProps) {
  const colors = useThemeStore((s) => s.colors);
  const displayValue = value === 'everyone' ? 'Everyone' : value === 'contacts' ? 'My Contacts' : 'Nobody';

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.itemValue, { color: colors.textTertiary }]}>{displayValue}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function PrivacyScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [lastSeen, setLastSeen] = useState<Visibility>('contacts');
  const [profilePhoto, setProfilePhoto] = useState<Visibility>('everyone');
  const [status, setStatus] = useState<Visibility>('contacts');
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);

  const cycleVisibility = (current: Visibility): Visibility => {
    const order: Visibility[] = ['everyone', 'contacts', 'nobody'];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Visibility */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile Visibility</Text>
      <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
        Control who can see your information
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <VisibilityItem
          label="Last Seen"
          value={lastSeen}
          onPress={() => setLastSeen(cycleVisibility(lastSeen))}
        />
        <VisibilityItem
          label="Profile Photo"
          value={profilePhoto}
          onPress={() => setProfilePhoto(cycleVisibility(profilePhoto))}
        />
        <VisibilityItem
          label="Status"
          value={status}
          onPress={() => setStatus(cycleVisibility(status))}
        />
      </View>

      {/* Chat Privacy */}
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
            value={readReceipts}
            onValueChange={setReadReceipts}
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
            value={typingIndicator}
            onValueChange={setTypingIndicator}
            trackColor={{ true: colors.accentLight, false: colors.surfaceVariant }}
          />
        </View>
      </View>

      {/* Blocked Users */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Blocked Users</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyBlocked}>
          <Ionicons name="ban-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            No blocked users
          </Text>
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
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
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
    gap: spacing.sm,
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
  itemValue: {
    fontSize: typography.fontSize.md,
  },
  emptyBlocked: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
  },
});
