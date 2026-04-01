import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContactStackParamList, Contact } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useContactStore } from '../../stores/contactStore';
import { subscribeToContacts } from '../../services/contactService';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<ContactStackParamList, 'ContactList'>;
};

function groupByLetter(contacts: Contact[]): { title: string; data: Contact[] }[] {
  const map: Record<string, Contact[]> = {};
  for (const c of contacts) {
    const letter = (c.displayName[0] || '#').toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(c);
  }
  return Object.keys(map)
    .sort()
    .map((title) => ({ title, data: map[title] }));
}

export default function ContactListScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { contacts, searchQuery, setContacts, setSearchQuery, getFilteredContacts } =
    useContactStore();

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToContacts(user.uid, setContacts);
    return unsub;
  }, [user?.uid, setContacts]);

  const filtered = getFilteredContacts();
  const sections = groupByLetter(filtered);

  const renderContact = (contact: Contact) => (
    <TouchableOpacity
      key={contact.uid}
      style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}
      onPress={() => navigation.navigate('ContactProfile', { uid: contact.uid })}
      activeOpacity={0.6}
    >
      <Avatar uri={contact.avatarUrl} name={contact.displayName} size="md" />
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{contact.displayName}</Text>
        <Text style={[styles.contactPin, { color: colors.textTertiary }]}>PIN: {contact.pin}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (contacts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Contacts</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add friends by their PIN to start chatting
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accentLight }]}
            onPress={() => navigation.navigate('AddContact', {})}
          >
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or PIN"
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contact list grouped A-Z */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item: section }) => (
          <View>
            <Text style={[styles.sectionHeader, { color: colors.textTertiary, backgroundColor: colors.background }]}>
              {section.title}
            </Text>
            {section.data.map(renderContact)}
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accentLight }]}
        onPress={() => navigation.navigate('AddContact', {})}
        activeOpacity={0.7}
      >
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPadding,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: layout.borderRadius.full,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    height: '100%',
  },
  list: { paddingBottom: 80 },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
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
  contactName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  contactPin: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
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
  emptyTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: layout.borderRadius.full,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
