import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface MessageActionMenuProps {
  visible: boolean;
  onClose: () => void;
  isMine: boolean;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export default function MessageActionMenu({
  visible,
  onClose,
  isMine,
  onReply,
  onCopy,
  onForward,
  onDelete,
}: MessageActionMenuProps) {
  const colors = useThemeStore((s) => s.colors);

  const actions: Action[] = [
    { icon: 'arrow-undo-outline', label: 'Reply', onPress: onReply },
    { icon: 'copy-outline', label: 'Copy', onPress: onCopy },
    { icon: 'arrow-forward-outline', label: 'Forward', onPress: onForward },
  ];

  if (isMine) {
    actions.push({ icon: 'trash-outline', label: 'Delete', onPress: onDelete, destructive: true });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          {actions.map((action, i) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.menuItem,
                i < actions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
              ]}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              activeOpacity={0.6}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={action.destructive ? colors.error : colors.text}
              />
              <Text
                style={[
                  styles.menuLabel,
                  { color: action.destructive ? colors.error : colors.text },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    borderRadius: layout.borderRadius.lg,
    minWidth: 200,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  menuLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
});
