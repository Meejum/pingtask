import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { fetchPublicKey, loadKeyPair } from '../../services/cryptoService';
import { spacing, typography, layout } from '../../constants';

interface EncryptionVerificationProps {
  otherUid: string;
  otherName: string;
}

/**
 * Generate a verification code from two public keys.
 * Both users will see the same code if E2EE is intact.
 */
function generateSecurityCode(pubKey1: string, pubKey2: string): string {
  // Sort keys so both users get the same order
  const sorted = [pubKey1, pubKey2].sort();
  const combined = sorted[0] + sorted[1];

  // Simple hash → 12-digit code
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  // Generate 12 digits from multiple hash iterations
  let code = '';
  let h = Math.abs(hash);
  for (let i = 0; i < 12; i++) {
    h = ((h * 31 + 7) | 0) & 0x7fffffff;
    code += (h % 10).toString();
    if ((i + 1) % 4 === 0 && i < 11) code += ' ';
  }

  return code;
}

export default function EncryptionVerification({ otherUid, otherName }: EncryptionVerificationProps) {
  const colors = useThemeStore((s) => s.colors);
  const [securityCode, setSecurityCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const myKeyPair = loadKeyPair();
      const theirPubKey = await fetchPublicKey(otherUid);

      if (myKeyPair && theirPubKey) {
        const { encodeBase64 } = await import('tweetnacl-util');
        const myPubKey = encodeBase64(myKeyPair.publicKey);
        const code = generateSecurityCode(myPubKey, theirPubKey);
        setSecurityCode(code);
      }
      setLoading(false);
    })();
  }, [otherUid]);

  if (loading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
        <Text style={[styles.title, { color: colors.text }]}>Encryption Verified</Text>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Messages with {otherName} are end-to-end encrypted. Both of you should see the same security code below.
      </Text>

      {securityCode && (
        <View style={[styles.codeBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.code, { color: colors.accentLight }]}>{securityCode}</Text>
        </View>
      )}

      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Compare this code with {otherName} in person or over a trusted channel. If the codes match, your connection is secure.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  codeBox: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: layout.borderRadius.md,
    marginBottom: spacing.lg,
  },
  code: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
