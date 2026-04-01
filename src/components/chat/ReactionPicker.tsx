import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useThemeStore } from '../../stores';
import { spacing, layout } from '../../constants';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onReact: (emoji: string) => void;
}

export default function ReactionPicker({ visible, onClose, onReact }: ReactionPickerProps) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.picker, { backgroundColor: colors.surface }]}>
          {REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiBtn}
              onPress={() => {
                onClose();
                onReact(emoji);
              }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

interface ReactionBubblesProps {
  reactions: Record<string, string[]>; // emoji -> [uid, uid, ...]
  onPress?: (emoji: string) => void;
}

export function ReactionBubbles({ reactions, onPress }: ReactionBubblesProps) {
  const colors = useThemeStore((s) => s.colors);
  const entries = Object.entries(reactions).filter(([, uids]) => uids.length > 0);

  if (entries.length === 0) return null;

  return (
    <View style={styles.bubblesRow}>
      {entries.map(([emoji, uids]) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.reactionBubble, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => onPress?.(emoji)}
          activeOpacity={0.6}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          {uids.length > 1 && (
            <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
              {uids.length}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    flexDirection: 'row',
    borderRadius: layout.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emojiBtn: {
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  bubblesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '600',
  },
});
