import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

export default function AboutScreen() {
  const colors = useThemeStore((s) => s.colors);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* App Info */}
      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="flash" size={40} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>PingTask</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Chat. Mention. Get it done.
        </Text>
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          Version 1.0.0 (Build 1)
        </Text>
      </View>

      {/* Links */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: colors.borderLight }]}
          onPress={() => Alert.alert('Terms of Service', 'Terms of Service will be available at launch.')}
          activeOpacity={0.6}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.text} />
          <Text style={[styles.itemLabel, { color: colors.text }]}>Terms of Service</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: colors.borderLight }]}
          onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy will be available at launch.')}
          activeOpacity={0.6}
        >
          <Ionicons name="shield-outline" size={20} color={colors.text} />
          <Text style={[styles.itemLabel, { color: colors.text }]}>Privacy Policy</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: colors.borderLight }]}
          onPress={() => Alert.alert('Licenses', 'Open source licenses will be listed here.')}
          activeOpacity={0.6}
        >
          <Ionicons name="code-slash-outline" size={20} color={colors.text} />
          <Text style={[styles.itemLabel, { color: colors.text }]}>Open Source Licenses</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Credits */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Credits</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.creditItem}>
          <Text style={[styles.creditLabel, { color: colors.text }]}>Built with</Text>
          <Text style={[styles.creditValue, { color: colors.textSecondary }]}>
            React Native + Expo + Firebase
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.creditItem}>
          <Text style={[styles.creditLabel, { color: colors.text }]}>Made in</Text>
          <Text style={[styles.creditValue, { color: colors.textSecondary }]}>
            Dubai, UAE
          </Text>
        </View>
      </View>

      <Text style={[styles.copyright, { color: colors.textTertiary }]}>
        {'\u00A9'} 2026 PingTask. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingTop: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  version: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  creditItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  creditLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  creditValue: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
  copyright: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.lg,
  },
});
