import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.text, { color: colors.textTertiary }]}>{date}</Text>
      </View>
    </View>
  );
}

export function formatMessageDate(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  const d = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
  if (diff < 172800000 && d.getDate() === now.getDate() - 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: layout.borderRadius.full,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
