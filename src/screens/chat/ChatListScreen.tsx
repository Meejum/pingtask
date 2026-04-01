import React, { useEffect, useState } from 'react';
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
import { ChatStackParamList, Conversation } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useChatStore } from '../../stores/chatStore';
import { subscribeToConversations, markMessagesDelivered } from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;
};

function formatTime(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  const d = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatListScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { conversations, setConversations } = useChatStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      // Mark messages as delivered for all conversations
      convos.forEach((c) => {
        const unread = c.unreadCount?.[user.uid] || 0;
        if (unread > 0) markMessagesDelivered(c.id, user.uid);
      });
    });
    return unsub;
  }, [user?.uid, setConversations]);

  const getConvoTitle = (convo: Conversation) => {
    if (convo.type === 'group') return convo.groupName || 'Group';
    const otherUid = convo.participantUids.find((u) => u !== user?.uid);
    if (otherUid && convo.participants[otherUid]) {
      return convo.participants[otherUid].displayName;
    }
    return 'Chat';
  };

  const getConvoAvatar = (convo: Conversation) => {
    if (convo.type === 'group') return convo.groupAvatarUrl;
    const otherUid = convo.participantUids.find((u) => u !== user?.uid);
    if (otherUid && convo.participants[otherUid]) {
      return convo.participants[otherUid].avatarUrl;
    }
    return null;
  };

  const filtered = search.trim()
    ? conversations.filter((c) => getConvoTitle(c).toLowerCase().includes(search.toLowerCase()))
    : conversations;

  if (conversations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Chats Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start a conversation with a contact
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.accentLight }]}
            onPress={() => navigation.navigate('NewChat')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>New Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderItem = ({ item: convo }: { item: Conversation }) => {
    const title = getConvoTitle(convo);
    const avatar = getConvoAvatar(convo);
    const unread = (user?.uid && convo.unreadCount?.[user.uid]) || 0;
    const lastMsg = convo.lastMessage;
    const preview = lastMsg
      ? lastMsg.type === 'image' ? '📷 Photo'
        : lastMsg.type === 'file' ? '📎 File'
        : lastMsg.text || ''
      : 'No messages yet';

    return (
      <TouchableOpacity
        style={[styles.convoRow, { borderBottomColor: colors.borderLight }]}
        onPress={() => navigation.navigate('ChatRoom', { conversationId: convo.id, title })}
        activeOpacity={0.6}
      >
        <Avatar uri={avatar} name={title} size="lg" />
        <View style={styles.convoContent}>
          <View style={styles.convoTop}>
            <Text style={[styles.convoName, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.convoTime, { color: unread > 0 ? colors.accentLight : colors.textTertiary }]}>
              {lastMsg ? formatTime(lastMsg.timestamp) : ''}
            </Text>
          </View>
          <View style={styles.convoBottom}>
            <Text
              style={[
                styles.convoPreview,
                { color: unread > 0 ? colors.text : colors.textSecondary },
                unread > 0 && styles.convoPreviewBold,
              ]}
              numberOfLines={1}
            >
              {convo.type === 'group' && lastMsg?.senderName
                ? `${lastMsg.senderName}: ${preview}`
                : preview}
            </Text>
            {unread > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search chats"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accentLight }]}
        onPress={() => navigation.navigate('NewChat')}
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
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
  searchInput: { flex: 1, fontSize: typography.fontSize.md, height: '100%' },
  list: { paddingBottom: 80 },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  convoContent: { flex: 1 },
  convoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convoName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, flex: 1, marginRight: spacing.sm },
  convoTime: { fontSize: typography.fontSize.xs },
  convoBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  convoPreview: { flex: 1, fontSize: typography.fontSize.md },
  convoPreviewBold: { fontWeight: typography.fontWeight.semibold },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: layout.screenPadding },
  iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxl },
  emptyTitle: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: typography.fontSize.md, textAlign: 'center', marginBottom: spacing.xxl },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: layout.borderRadius.full },
  emptyButtonText: { color: '#FFFFFF', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
