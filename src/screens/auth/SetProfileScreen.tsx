import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout, config } from '../../constants';

export default function SetProfileScreen() {
  const colors = useThemeStore((s) => s.colors);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForPin, setWaitingForPin] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Listen for user doc (created by Cloud Function with PIN)
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.pin) {
          setPin(data.pin);
          setWaitingForPin(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleContinue = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        displayName: displayName.trim(),
        updatedAt: serverTimestamp(),
      });

      // Fetch full user doc and set in store
      const userDoc = await (await import('firebase/firestore')).getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as any);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Set Up Profile</Text>

      {waitingForPin ? (
        <View style={styles.pinWaiting}>
          <ActivityIndicator size="large" color={colors.accentLight} />
          <Text style={[styles.pinWaitingText, { color: colors.textSecondary }]}>
            Generating your unique PIN...
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.pinBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>
              Your PIN
            </Text>
            <Text style={[styles.pinValue, { color: colors.accentLight }]}>
              {pin}
            </Text>
            <Text style={[styles.pinHint, { color: colors.textTertiary }]}>
              Share this PIN so others can add you
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Display Name"
              placeholderTextColor={colors.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={config.MAX_DISPLAY_NAME_LENGTH}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.accentLight, opacity: loading ? 0.6 : 1 },
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting Up...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: layout.screenPadding,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxl,
  },
  pinWaiting: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  pinWaitingText: {
    fontSize: typography.fontSize.md,
  },
  pinBox: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  pinLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  pinValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  pinHint: {
    fontSize: typography.fontSize.xs,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  button: {
    height: layout.inputHeight,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
