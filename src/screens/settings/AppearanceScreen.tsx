import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

type ThemeOption = { key: 'light' | 'dark'; label: string; icon: keyof typeof Ionicons.glyphMap };

const THEMES: ThemeOption[] = [
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function AppearanceScreen() {
  const colors = useThemeStore((s) => s.colors);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Theme */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme</Text>
      <View style={[styles.themeRow]}>
        {THEMES.map((t) => {
          const active = mode === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.themeCard,
                { backgroundColor: colors.surface, borderColor: active ? colors.accentLight : colors.border },
                active && styles.themeCardActive,
              ]}
              onPress={() => setMode(t.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={t.icon} size={32} color={active ? colors.accentLight : colors.textTertiary} />
              <Text style={[styles.themeLabel, { color: active ? colors.accentLight : colors.text }]}>
                {t.label}
              </Text>
              {active && (
                <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chat Appearance */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Chat</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.item}>
          <Ionicons name="text-outline" size={20} color={colors.text} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Font Size</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>Medium</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.item}>
          <Ionicons name="image-outline" size={20} color={colors.text} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Chat Wallpaper</Text>
            <Text style={[styles.itemSub, { color: colors.textTertiary }]}>Default</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </View>

      {/* Preview */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preview</Text>
      <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.previewBubbleSent, { backgroundColor: colors.sent }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>Hey! How's it going?</Text>
        </View>
        <View style={[styles.previewBubbleReceived, { backgroundColor: colors.received, borderColor: colors.border }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>All good! Working on PingTask</Text>
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
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 2,
    gap: spacing.sm,
  },
  themeCardActive: {
    borderWidth: 2,
  },
  themeLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  previewCard: {
    padding: spacing.lg,
    borderRadius: layout.borderRadius.lg,
    gap: spacing.md,
  },
  previewBubbleSent: {
    alignSelf: 'flex-end',
    padding: spacing.md,
    borderRadius: layout.borderRadius.md,
    borderBottomRightRadius: 4,
    maxWidth: '75%',
  },
  previewBubbleReceived: {
    alignSelf: 'flex-start',
    padding: spacing.md,
    borderRadius: layout.borderRadius.md,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '75%',
  },
  previewText: {
    fontSize: typography.fontSize.md,
  },
});
