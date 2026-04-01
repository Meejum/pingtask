import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList, Contact } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useContactStore } from '../../stores/contactStore';
import { subscribeToContacts } from '../../services/contactService';
import { createGroupConversation } from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';
import { Avatar, Button, Input } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<ChatStackParamList, 'NewGroup'>;
};

export default function NewGroupScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { contacts, setContacts } = useContactStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToContacts(user.uid, setContacts);
    return unsub;
  }, [user?.uid, setContacts]);

  const toggleSelect = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selected.size === 0) {
      Alert.alert('Error', 'Select at least one member');
      return;
    }
    if (!user) return;

    setCreating(true);
    try {
      const members = contacts
        .filter((c) => selected.has(c.uid))
        .map((c) => ({ uid: c.uid, displayName: c.displayName, avatarUrl: c.avatarUrl }));

      const convoId = await createGroupConversation(
        user.uid,
        user.displayName,
        user.avatarUrl,
        members,
        groupName.trim(),
      );

      navigation.replace('ChatRoom', { conversationId: convoId, title: groupName.trim() });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Group name */}
      <View style={styles.nameSection}>
        <Input
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
      </View>

      {/* Selected chips */}
      {selected.size > 0 && (
        <View style={styles.chipRow}>
          {contacts
            .filter((c) => selected.has(c.uid))
            .map((c) => (
              <TouchableOpacity
                key={c.uid}
                style={[styles.chip, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => toggleSelect(c.uid)}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{c.displayName}</Text>
                <Ionicons name="close" size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Contact list */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Add Members ({selected.size} selected)
      </Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.uid);
          return (
            <TouchableOpacity
              style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => toggleSelect(item.uid)}
              activeOpacity={0.6}
            >
              <Avatar uri={item.avatarUrl} name={item.displayName} size="md" />
              <Text style={[styles.contactName, { color: colors.text }]}>{item.displayName}</Text>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isSelected ? colors.accentLight : colors.textTertiary}
              />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
      />

      {/* Create button */}
      <View style={styles.footer}>
        <Button
          title={`Create Group (${selected.size})`}
          onPress={handleCreate}
          loading={creating}
          disabled={selected.size === 0 || !groupName.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nameSection: {
    padding: layout.screenPadding,
    paddingBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: layout.borderRadius.full,
    gap: spacing.xs,
  },
  chipText: { fontSize: typography.fontSize.sm },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  contactName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  list: { paddingBottom: 80 },
  footer: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
});
