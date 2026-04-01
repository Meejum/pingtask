import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList, Contact } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useContactStore } from '../../stores/contactStore';
import { subscribeToContacts } from '../../services/contactService';
import { getOrCreateDirectConversation } from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<ChatStackParamList, 'NewChat'>;
};

export default function NewChatScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { contacts, setContacts } = useContactStore();

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToContacts(user.uid, setContacts);
    return unsub;
  }, [user?.uid, setContacts]);

  const handleSelect = async (contact: Contact) => {
    if (!user) return;
    const convoId = await getOrCreateDirectConversation(
      user.uid,
      user.displayName,
      user.avatarUrl,
      contact.uid,
      contact.displayName,
      contact.avatarUrl,
    );
    navigation.replace('ChatRoom', { conversationId: convoId, title: contact.displayName });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* New Group option */}
      <TouchableOpacity
        style={[styles.groupRow, { borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('NewGroup')}
        activeOpacity={0.6}
      >
        <View style={[styles.groupIcon, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="people" size={20} color="#FFFFFF" />
        </View>
        <Text style={[styles.groupLabel, { color: colors.text }]}>New Group</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Contacts */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Contacts</Text>

      {contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            No contacts yet. Add someone first!
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.6}
            >
              <Avatar uri={item.avatarUrl} name={item.displayName} size="md" />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]}>{item.displayName}</Text>
                <Text style={[styles.contactPin, { color: colors.textTertiary }]}>PIN: {item.pin}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
  contactPin: { fontSize: typography.fontSize.xs, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyText: { fontSize: typography.fontSize.md, textAlign: 'center' },
});
