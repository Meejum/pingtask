import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

const URL_REGEX = /https?:\/\/[^\s]+/g;

export function extractUrls(text: string): string[] {
  return text.match(URL_REGEX) || [];
}

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const colors = useThemeStore((s) => s.colors);

  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch {
    domain = url;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Ionicons name="link-outline" size={16} color={colors.accentLight} />
        <View style={styles.textContent}>
          <Text style={[styles.domain, { color: colors.accentLight }]} numberOfLines={1}>
            {domain}
          </Text>
          <Text style={[styles.url, { color: colors.textTertiary }]} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <Ionicons name="open-outline" size={14} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  textContent: {
    flex: 1,
  },
  domain: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  url: {
    fontSize: typography.fontSize.xs,
    marginTop: 1,
  },
});
