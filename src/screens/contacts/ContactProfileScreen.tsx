import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ContactStackParamList, User } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { removeContact } from '../../services/contactService';
import { getOrCreateDirectConversation } from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';
import { Avatar, Button, LoadingScreen } from '../../components/common';
import { showAlert } from '../../utils/alert';

type Props = {
  navigation: NativeStackNavigationProp<ContactStackParamList, 'ContactProfile'>;
  route: RouteProp<ContactStackParamList, 'ContactProfile'>;
};

export default function ContactProfileScreen({ navigation, route }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const currentUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(db, 'users', route.params.uid));
      if (d.exists()) setProfile(d.data() as User);
      setLoading(false);
    })();
  }, [route.params.uid]);

  const handleRemove = () => {
    if (!currentUser?.uid || !profile) return;
    showAlert(
      'Remove Contact',
      `Remove ${profile.displayName} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeContact(currentUser.uid, profile.uid);
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (loading) return <LoadingScreen />;
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>User not found</Text>
      </View>
    );
  }

  const statusColor =
    profile.status === 'available' ? colors.online
    : profile.status === 'busy' ? colors.busy
    : colors.away;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Avatar uri={profile.avatarUrl} name={profile.displayName} size="xxl" showOnline isOnline={profile.isOnline} />
        <Text style={[styles.name, { color: colors.text }]}>{profile.displayName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {profile.status}
          </Text>
        </View>
        {profile.statusMessage ? (
          <Text style={[styles.statusMessage, { color: colors.textTertiary }]}>
            "{profile.statusMessage}"
          </Text>
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print-outline" size={20} color={colors.accentLight} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>PIN</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile.pin}</Text>
          </View>
        </View>
        {profile.email && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.accentLight} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.email}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.6}
          onPress={async () => {
            if (!currentUser || !profile) return;
            const convoId = await getOrCreateDirectConversation(
              currentUser.uid, currentUser.displayName, currentUser.avatarUrl,
              profile.uid, profile.displayName, profile.avatarUrl,
            );
            navigation.getParent()?.navigate('ChatTab', {
              screen: 'ChatRoom',
              params: { conversationId: convoId, title: profile.displayName },
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.accentLight} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Send Message</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Button
        title="Remove Contact"
        variant="outline"
        onPress={handleRemove}
        textStyle={{ color: colors.error }}
        style={{ borderColor: colors.error, marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: typography.fontSize.md, textTransform: 'capitalize' },
  statusMessage: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  section: {
    borderRadius: layout.borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: typography.fontSize.xs },
  infoValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionLabel: { flex: 1, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
});
