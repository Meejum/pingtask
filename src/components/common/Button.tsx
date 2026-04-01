import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '../../stores';
import { typography, layout, spacing } from '../../constants';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useThemeStore((s) => s.colors);
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [styles.base];
  const labelStyles: TextStyle[] = [styles.label];

  switch (variant) {
    case 'primary':
      containerStyles.push({ backgroundColor: colors.accentLight });
      labelStyles.push({ color: '#FFFFFF' });
      break;
    case 'outline':
      containerStyles.push({
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.accentLight,
      });
      labelStyles.push({ color: colors.accentLight });
      break;
    case 'ghost':
      containerStyles.push({ backgroundColor: 'transparent' });
      labelStyles.push({ color: colors.accentLight });
      break;
  }

  if (isDisabled) {
    containerStyles.push({ opacity: 0.6 });
  }

  return (
    <TouchableOpacity
      style={[...containerStyles, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : colors.accentLight}
        />
      ) : (
        <Text style={[...labelStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
