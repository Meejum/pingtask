import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Button } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.accentLight }]}>
          PingTask
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Chat. Mention. Get it done.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
        />
        <Button
          title="Sign In"
          variant="outline"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: layout.screenPadding,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
