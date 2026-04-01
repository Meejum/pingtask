import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useThemeStore } from '../../stores';

interface WebContainerProps {
  children: ReactNode;
}

/**
 * On web, centers the app in a phone-sized container with a nice background.
 * On mobile, renders children directly (no wrapper).
 */
export default function WebContainer({ children }: WebContainerProps) {
  const colors = useThemeStore((s) => s.colors);
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < 600) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.outer, { backgroundColor: colors.primaryLight }]}>
      <View style={[styles.inner, { backgroundColor: colors.background }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: 900,
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow for desktop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
});
