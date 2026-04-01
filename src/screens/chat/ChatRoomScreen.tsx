import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList, Message } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useChatStore } from '../../stores/chatStore';
import {
  subscribeToMessages,
  sendMessage,
  decryptMessages,
  markConversationRead,
  setTyping,
} from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';
import MessageActionMenu from '../../components/chat/MessageActionMenu';
import TypingIndicator from '../../components/chat/TypingIndicator';
import ReactionPicker, { ReactionBubbles } from '../../components/chat/ReactionPicker';
import LinkPreview, { extractUrls } from '../../components/chat/LinkPreview';
import {
  toggleReaction,
  sendPing,
  sendVoiceMessage,
  deleteMessage,
} from '../../services/chatService';
import { uploadVoiceNote } from '../../services/voiceService';
import VoiceNoteButton from '../../components/chat/VoiceNoteButton';
import VoiceNoteBubble from '../../components/chat/VoiceNoteBubble';
import DateSeparator, { formatMessageDate } from '../../components/chat/DateSeparator';
import ScrollToBottomBtn from '../../components/chat/ScrollToBottom';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

// Set up header button to navigate to ChatInfo
function useHeaderRight(navigation: Props['navigation'], conversationId: string) {
  const colors = useThemeStore((s) => s.colors);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatInfo', { conversationId })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, conversationId, colors.text]);
}

function formatMsgTime(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status, color }: { status: string; color: string }) {
  if (status === 'read') return <Ionicons name="checkmark-done" size={14} color="#4FC3F7" />;
  if (status === 'delivered') return <Ionicons name="checkmark-done" size={14} color={color} />;
  if (status === 'sent') return <Ionicons name="checkmark" size={14} color={color} />;
  return <Ionicons name="time-outline" size={12} color={color} />;
}

export default function ChatRoomScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  useHeaderRight(navigation, conversationId);
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { currentMessages, setCurrentMessages } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [reactionMsg, setReactionMsg] = useState<Message | null>(null);
  const lastTapRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, async (msgs) => {
      // Decrypt E2EE messages
      if (user?.uid) {
        const decrypted = await decryptMessages(msgs, user.uid);
        setCurrentMessages(decrypted);
      } else {
        setCurrentMessages(msgs);
      }
    });
    if (user?.uid) markConversationRead(conversationId, user.uid);
    return () => {
      unsub();
      setCurrentMessages([]);
      if (user?.uid) setTyping(conversationId, user.uid, false);
    };
  }, [conversationId, user?.uid, setCurrentMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (currentMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [currentMessages.length]);

  // Find the other participant for E2EE in direct chats
  const getRecipientUid = useCallback((): string | undefined => {
    const convo = useChatStore.getState().conversations.find((c) => c.id === conversationId);
    if (!convo || convo.type !== 'direct' || !user?.uid) return undefined;
    return convo.participantUids.find((uid) => uid !== user.uid);
  }, [conversationId, user?.uid]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !user?.uid) return;

    setText('');
    setSending(true);
    try {
      const recipientUid = getRecipientUid();
      await sendMessage(conversationId, user.uid, user.displayName, trimmed, [], recipientUid);
      if (user.uid) setTyping(conversationId, user.uid, false);
    } catch (e: any) {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, user, conversationId, getRecipientUid]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (!user?.uid) return;

    // Debounced typing indicator
    setTyping(conversationId, user.uid, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(conversationId, user.uid, false);
    }, 3000);
  };

  // Get typing users for this conversation
  const getTypingNames = (): string[] => {
    const convo = useChatStore.getState().conversations.find((c) => c.id === conversationId);
    if (!convo?.typing || !user?.uid) return [];
    return Object.entries(convo.typing)
      .filter(([uid, isTyping]) => uid !== user.uid && isTyping)
      .map(([uid]) => convo.participants[uid]?.displayName || 'Someone');
  };

  const typingNames = getTypingNames();

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isMine = msg.senderId === user?.uid;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          setSelectedMsg(msg);
          setMenuVisible(true);
        }}
        onPress={() => {
          const now = Date.now();
          if (lastTapRef.current.id === msg.id && now - lastTapRef.current.time < 300) {
            setReactionMsg(msg);
            lastTapRef.current = { id: '', time: 0 };
          } else {
            lastTapRef.current = { id: msg.id, time: now };
          }
        }}
        delayLongPress={400}
      >
      <View style={[styles.bubbleRow, isMine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
        {/* Reply preview */}
        {replyTo && msg.id === currentMessages[currentMessages.length - 1]?.id && null}
        <View
          style={[
            styles.bubble,
            isMine
              ? [styles.bubbleSent, { backgroundColor: colors.sent }]
              : [styles.bubbleReceived, { backgroundColor: colors.received, borderColor: colors.border }],
          ]}
        >
          {!isMine && (
            <Text style={[styles.senderName, { color: colors.accentLight }]}>
              {msg.senderName}
            </Text>
          )}
          {/* Deleted message */}
          {msg.isDeleted ? (
            <Text style={[styles.deletedText, { color: colors.textTertiary }]}>
              <Ionicons name="ban-outline" size={12} /> This message was deleted
            </Text>
          ) : /* Ping message */
          (msg as any).isPing ? (
            <Text style={[styles.pingText, { color: colors.accentLight }]}>
              🔔 Ping!
            </Text>
          ) : /* Voice note */
          msg.type === 'voice' && msg.mediaUrl ? (
            <VoiceNoteBubble mediaUrl={msg.mediaUrl} durationMs={(msg as any).durationMs} />
          ) : (
            <Text style={[styles.messageText, { color: colors.text }]}>{msg.text}</Text>
          )}
          {/* Link previews */}
          {msg.text && extractUrls(msg.text).slice(0, 1).map((url) => (
            <LinkPreview key={url} url={url} />
          ))}
          {/* Reactions */}
          {(msg as any).reactions && (
            <ReactionBubbles
              reactions={(msg as any).reactions}
              onPress={(emoji) => {
                if (user?.uid) toggleReaction(conversationId, msg.id, user.uid, emoji);
              }}
            />
          )}
          <View style={styles.metaRow}>
            <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
              {formatMsgTime(msg.createdAt)}
            </Text>
            {isMine && (
              <StatusIcon status={msg.aggregateStatus || 'sending'} color={colors.textTertiary} />
            )}
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // Date separator logic
          let showDate = false;
          if (index === 0) {
            showDate = true;
          } else {
            const prev = currentMessages[index - 1];
            const prevDate = formatMessageDate(prev.createdAt);
            const currDate = formatMessageDate(item.createdAt);
            showDate = prevDate !== currDate;
          }

          return (
            <>
              {showDate && <DateSeparator date={formatMessageDate(item.createdAt)} />}
              {renderMessage({ item } as any)}
            </>
          );
        }}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={<TypingIndicator names={typingNames} />}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
          setShowScrollBtn(distanceFromBottom > 200);
        }}
        scrollEventThrottle={100}
        onContentSizeChange={() => {
          if (!showScrollBtn) flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      <ScrollToBottomBtn
        visible={showScrollBtn}
        onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* E2EE indicator */}
      {getRecipientUid() && (
        <View style={[styles.e2eeBanner, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="lock-closed" size={12} color={colors.success} />
          <Text style={[styles.e2eeText, { color: colors.textTertiary }]}>
            Messages are end-to-end encrypted
          </Text>
        </View>
      )}

      {/* Reply bar */}
      {replyTo && (
        <View style={[styles.replyBar, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.replyStripe, { backgroundColor: colors.accentLight }]} />
          <View style={styles.replyContent}>
            <Text style={[styles.replyName, { color: colors.accentLight }]}>{replyTo.senderName}</Text>
            <Text style={[styles.replyText, { color: colors.textSecondary }]} numberOfLines={1}>
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {/* Ping button */}
        <TouchableOpacity
          style={styles.inputAction}
          onPress={() => {
            if (user?.uid) sendPing(conversationId, user.uid, user.displayName);
          }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
          placeholder={replyTo ? `Reply to ${replyTo.senderName}...` : 'Type a message...'}
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={handleTextChange}
          maxLength={2000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          returnKeyType="send"
        />
        {text.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.accentLight }]}
            onPress={handleSend}
            disabled={sending}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <VoiceNoteButton
            onRecorded={async (uri, durationMs) => {
              if (!user?.uid) return;
              const url = await uploadVoiceNote(conversationId, uri);
              await sendVoiceMessage(conversationId, user.uid, user.displayName, url, durationMs);
            }}
          />
        )}
      </View>

      {/* Message Action Menu */}
      <MessageActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        isMine={selectedMsg?.senderId === user?.uid}
        onReply={() => {
          if (selectedMsg) setReplyTo(selectedMsg);
        }}
        onCopy={() => {
          if (selectedMsg?.text) {
            try { navigator.clipboard.writeText(selectedMsg.text); } catch {}
          }
        }}
        onForward={() => {
          // TODO: forward to another conversation
        }}
        onDelete={() => {
          if (selectedMsg) deleteMessage(conversationId, selectedMsg.id);
        }}
      />

      {/* Reaction Picker */}
      <ReactionPicker
        visible={!!reactionMsg}
        onClose={() => setReactionMsg(null)}
        onReact={(emoji) => {
          if (reactionMsg && user?.uid) {
            toggleReaction(conversationId, reactionMsg.id, user.uid, emoji);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  bubbleRow: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  bubbleRowRight: {
    alignSelf: 'flex-end',
  },
  bubbleRowLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.md,
  },
  bubbleSent: {
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  deletedText: {
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
  },
  pingText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  replyStripe: {
    width: 3,
    height: '100%',
    borderRadius: 2,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  replyText: {
    fontSize: typography.fontSize.sm,
  },
  e2eeBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  e2eeText: {
    fontSize: 10,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  inputAction: {
    paddingBottom: 6,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderRadius: layout.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
