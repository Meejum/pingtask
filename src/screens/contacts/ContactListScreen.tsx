import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContactStackParamList } from '../../types';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<ContactStackParamList, 'ContactList'>;
};

export default function ContactListScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>No Contacts</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Add friends by their PIN to start chatting
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
          onPress={() => navigation.navigate('AddContact', {})}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Add Contact</Text>
        </TouchableOpacity>
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: layout.borderRadius.full,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
