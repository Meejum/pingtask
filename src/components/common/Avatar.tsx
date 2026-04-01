import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores';
import { layout, typography } from '../../constants';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  showOnline?: boolean;
  isOnline?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  uri,
  name = '',
  size = 'md',
  showOnline = false,
  isOnline = false,
}: AvatarProps) {
  const colors = useThemeStore((s) => s.colors);
  const dimension = layout.avatarSize[size];
  const fontSize =
    size === 'xxl'
      ? typography.fontSize.xxxl
      : size === 'xl'
        ? typography.fontSize.xxl
        : size === 'lg'
          ? typography.fontSize.xl
          : size === 'md'
            ? typography.fontSize.lg
            : typography.fontSize.sm;

  const dotSize = Math.max(10, dimension * 0.25);

  return (
    <View style={{ width: dimension, height: dimension }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: colors.surfaceVariant,
            },
          ]}
        >
          <Text
            style={[styles.initials, { fontSize, color: colors.textSecondary }]}
          >
            {getInitials(name) || '?'}
          </Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? colors.online : colors.away,
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
