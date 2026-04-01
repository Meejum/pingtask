import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useAuthStore } from '../../stores';
import { useChatStore } from '../../stores/chatStore';
import { Conversation } from '../../types';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../common';

interface ForwardPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (conversationId: string, title: string) => void;
}

export default function ForwardPicker({ visible, onClose, onSelect }: ForwardPickerProps) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { conversations } = useChatStore();

  const getTitle = (c: Conversation) => {
    if (c.type === 'group') return c.groupName || 'Group';
    const other = c.participantUids.find((u) => u !== user?.uid);
    if (other && c.participants[other]) return c.participants[other].displayName;
    return 'Chat';
  };

  const getAvatar = (c: Conversation) => {
    if (c.type === 'group') return c.groupAvatarUrl;
    const other = c.participantUids.find((u) => u !== user?.uid);
    if (other && c.participants[other]) return c.participants[other].avatarUrl;
    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text }]}>Forward to...</Text>

          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: colors.borderLight }]}
                onPress={() => {
                  onClose();
                  onSelect(item.id, getTitle(item));
                }}
                activeOpacity={0.6}
              >
                <Avatar uri={getAvatar(item)} name={getTitle(item)} size="md" />
                <Text style={[styles.name, { color: colors.text }]}>{getTitle(item)}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.textTertiary }]}>No conversations yet</Text>
            }
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: '#666', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, paddingHorizontal: layout.screenPadding, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  name: { flex: 1, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
  empty: { textAlign: 'center', padding: spacing.xxl, fontSize: typography.fontSize.md },
});
