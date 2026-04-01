import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ChatStackParamList, Conversation, Participant } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Avatar, LoadingScreen } from '../../components/common';
import { showAlert } from '../../utils/alert';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatInfo'>;

export default function ChatInfoScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(db, 'conversations', conversationId));
      if (d.exists()) setConvo({ id: d.id, ...d.data() } as Conversation);
      setLoading(false);
    })();
  }, [conversationId]);

  if (loading) return <LoadingScreen />;
  if (!convo) return <LoadingScreen message="Chat not found" />;

  const isGroup = convo.type === 'group';
  const members = Object.entries(convo.participants).map(([uid, data]) => ({
    uid,
    ...(data as Participant),
  }));

  const otherMember = !isGroup
    ? members.find((m) => m.uid !== user?.uid)
    : null;

  const title = isGroup ? convo.groupName : otherMember?.displayName || 'Chat';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          uri={isGroup ? convo.groupAvatarUrl : otherMember?.avatarUrl}
          name={title || ''}
          size="xxl"
        />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {isGroup && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {members.length} members
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={22} color={colors.text} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="image-outline" size={22} color={colors.text} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Media</Text>
        </TouchableOpacity>
      </View>

      {/* Members */}
      {isGroup && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Members ({members.length})
          </Text>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            {members.map((m) => (
              <View
                key={m.uid}
                style={[styles.memberRow, { borderBottomColor: colors.borderLight }]}
              >
                <Avatar uri={m.avatarUrl} name={m.displayName} size="md" />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {m.displayName}
                    {m.uid === user?.uid ? ' (You)' : ''}
                  </Text>
                  {m.role === 'admin' && (
                    <Text style={[styles.memberRole, { color: colors.accentLight }]}>Admin</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Danger Zone */}
      <View style={[styles.section, { backgroundColor: colors.surface, marginTop: spacing.lg }]}>
        <TouchableOpacity
          style={styles.dangerRow}
          onPress={() => showAlert('Clear Chat', 'Delete all messages in this chat?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => {} },
          ])}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={[styles.dangerLabel, { color: colors.error }]}>Clear Chat History</Text>
        </TouchableOpacity>
        {isGroup && (
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={() => showAlert('Leave Group', 'Are you sure you want to leave this group?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
            ])}
          >
            <Ionicons name="exit-outline" size={20} color={colors.error} />
            <Text style={[styles.dangerLabel, { color: colors.error }]}>Leave Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, marginTop: spacing.lg },
  subtitle: { fontSize: typography.fontSize.md, marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.xxl },
  actionBtn: { alignItems: 'center', padding: spacing.lg, borderRadius: layout.borderRadius.lg, width: 80, gap: spacing.xs },
  actionLabel: { fontSize: typography.fontSize.xs },
  sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
  section: { borderRadius: layout.borderRadius.lg, overflow: 'hidden' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  memberInfo: { flex: 1 },
  memberName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
  memberRole: { fontSize: typography.fontSize.xs, marginTop: 2 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  dangerLabel: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
});
