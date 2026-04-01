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
  markConversationRead,
  setTyping,
} from '../../services/chatService';
import { spacing, typography, layout } from '../../constants';

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
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, setCurrentMessages);
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

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !user?.uid) return;

    setText('');
    setSending(true);
    try {
      await sendMessage(conversationId, user.uid, user.displayName, trimmed);
      if (user.uid) setTyping(conversationId, user.uid, false);
    } catch (e: any) {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, user, conversationId]);

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

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isMine = msg.senderId === user?.uid;

    return (
      <View style={[styles.bubbleRow, isMine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
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
          <Text style={[styles.messageText, { color: colors.text }]}>{msg.text}</Text>
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
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input Area */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.inputAction}>
          <Ionicons name="add-circle-outline" size={26} color={colors.textTertiary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={2000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: text.trim() ? colors.accentLight : colors.surfaceVariant }]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color={text.trim() ? '#FFFFFF' : colors.textTertiary} />
        </TouchableOpacity>
      </View>
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
