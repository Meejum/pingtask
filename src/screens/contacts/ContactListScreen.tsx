import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores';
import { typography } from '../../constants';

export default function ContactListScreen() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Add contacts by their PIN to start chatting.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: typography.fontSize.xxl, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: typography.fontSize.md, textAlign: 'center' },
});
