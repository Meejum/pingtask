import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

interface HelpItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
}

function HelpItem({ icon, label, subtitle, onPress }: HelpItemProps) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon} size={20} color={colors.accentLight} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.itemSub, { color: colors.textTertiary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const FAQ_ITEMS = [
  { q: 'How do I add a contact?', a: 'Go to the Contacts tab and tap "Add Contact". Enter their unique PIN to find them.' },
  { q: 'How do tasks work?', a: 'Type @name followed by a task description in any chat. A task will be automatically created and assigned.' },
  { q: 'Can I change my PIN?', a: 'No, your PIN is permanently assigned to your account for consistency.' },
  { q: 'How do I create a group?', a: 'Go to Chats, tap "New Chat", then select "New Group" and choose members.' },
];

export default function HelpSupportScreen() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Contact */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Get Help</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <HelpItem
          icon="chatbox-outline"
          label="Contact Support"
          subtitle="Chat with our support team"
          onPress={() => Alert.alert('Support', 'Email us at support@pingtask.app')}
        />
        <HelpItem
          icon="bug-outline"
          label="Report a Bug"
          subtitle="Let us know what went wrong"
          onPress={() => Alert.alert('Report Bug', 'Email bugs@pingtask.app with a description of the issue')}
        />
        <HelpItem
          icon="bulb-outline"
          label="Suggest a Feature"
          subtitle="We'd love to hear your ideas"
          onPress={() => Alert.alert('Feature Request', 'Email ideas@pingtask.app with your suggestion')}
        />
      </View>

      {/* FAQ */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Frequently Asked Questions</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {FAQ_ITEMS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.faqItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => Alert.alert(faq.q, faq.a)}
            activeOpacity={0.6}
          >
            <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.q}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
