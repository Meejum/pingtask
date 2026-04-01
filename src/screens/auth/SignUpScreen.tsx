import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Button, Input } from '../../components/common';
import { signUp } from '../../services/authService';
import { showAlert } from '../../utils/alert';

export default function SignUpScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!agreedToPolicy) {
      showAlert('Error', 'You must agree to the Privacy Policy to create an account');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch (error: any) {
      showAlert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign up to get your unique PIN
        </Text>

        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Privacy Policy Consent */}
        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setAgreedToPolicy(!agreedToPolicy)}
          activeOpacity={0.6}
        >
          <Ionicons
            name={agreedToPolicy ? 'checkbox' : 'square-outline'}
            size={22}
            color={agreedToPolicy ? colors.accentLight : colors.textTertiary}
          />
          <Text style={[styles.consentText, { color: colors.textSecondary }]}>
            I agree to the{' '}
            <Text style={{ color: colors.accentLight, textDecorationLine: 'underline' }}>
              Privacy Policy
            </Text>
            {' '}and consent to the processing of my personal data as described.
          </Text>
        </TouchableOpacity>

        <Button
          title={loading ? 'Creating Account...' : 'Sign Up'}
          onPress={handleSignUp}
          loading={loading}
          disabled={!agreedToPolicy}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    padding: layout.screenPadding,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  consentText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
});
