import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ContactStackParamList, User } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Button, Input, Avatar } from '../../components/common';
import { searchByPin, addContact } from '../../services/contactService';

type Props = {
  navigation: NativeStackNavigationProp<ContactStackParamList, 'AddContact'>;
  route: RouteProp<ContactStackParamList, 'AddContact'>;
};

export default function AddContactScreen({ navigation, route }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const currentUser = useAuthStore((s) => s.user);
  const [pin, setPin] = useState(route.params?.pin || '');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    const trimmed = pin.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a PIN');
      return;
    }
    if (trimmed === currentUser?.pin) {
      Alert.alert('Error', "That's your own PIN!");
      return;
    }

    setSearching(true);
    setFoundUser(null);
    setNotFound(false);
    try {
      const user = await searchByPin(trimmed);
      if (user) {
        setFoundUser(user);
      } else {
        setNotFound(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!foundUser || !currentUser?.uid) return;

    setAdding(true);
    try {
      await addContact(currentUser.uid, foundUser);
      Alert.alert('Added!', `${foundUser.displayName} has been added to your contacts`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add by PIN</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Enter someone's unique PIN to find and add them
      </Text>

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Input
            placeholder="Enter PIN (e.g. H77WA29D)"
            value={pin}
            onChangeText={(t) => {
              setPin(t.toUpperCase());
              setFoundUser(null);
              setNotFound(false);
            }}
            autoCapitalize="characters"
            maxLength={8}
            onSubmitEditing={handleSearch}
          />
        </View>
        <Button
          title="Search"
          onPress={handleSearch}
          loading={searching}
          style={styles.searchButton}
        />
      </View>

      {/* Searching indicator */}
      {searching && (
        <View style={styles.resultArea}>
          <ActivityIndicator color={colors.accentLight} />
        </View>
      )}

      {/* Found user */}
      {foundUser && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Avatar uri={foundUser.avatarUrl} name={foundUser.displayName} size="lg" />
          <View style={styles.resultInfo}>
            <Text style={[styles.resultName, { color: colors.text }]}>
              {foundUser.displayName}
            </Text>
            <Text style={[styles.resultPin, { color: colors.textSecondary }]}>
              PIN: {foundUser.pin}
            </Text>
            {foundUser.statusMessage ? (
              <Text style={[styles.resultStatus, { color: colors.textTertiary }]}>
                {foundUser.statusMessage}
              </Text>
            ) : null}
          </View>
          <Button
            title={adding ? 'Adding...' : 'Add'}
            onPress={handleAdd}
            loading={adding}
            style={styles.addBtn}
          />
        </View>
      )}

      {/* Not found */}
      {notFound && (
        <View style={[styles.notFound, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            No user found with PIN "{pin}"
          </Text>
          <Text style={[styles.notFoundHint, { color: colors.textTertiary }]}>
            Double-check the PIN and try again
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: layout.screenPadding,
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
  searchRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    alignItems: 'flex-start',
  },
  inputWrap: { flex: 1 },
  searchButton: {
    marginTop: 0,
    minWidth: 80,
  },
  resultArea: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: layout.borderRadius.lg,
    gap: spacing.md,
  },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  resultPin: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  resultStatus: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  addBtn: {
    minWidth: 70,
  },
  notFound: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: layout.borderRadius.lg,
    gap: spacing.sm,
  },
  notFoundText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  notFoundHint: {
    fontSize: typography.fontSize.sm,
  },
});
