import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

export default function TaskListScreen() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Ionicons name="checkbox-outline" size={48} color={colors.textTertiary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>No Tasks</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          @mention someone in a chat to assign them a task
        </Text>
        <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="bulb-outline" size={20} color={colors.accentLight} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Try typing "@Ali please review the design" in a chat
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: layout.borderRadius.md,
    maxWidth: 300,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
});
