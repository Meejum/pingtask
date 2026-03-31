import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ContactStackParamList } from '../types';
import { useThemeStore } from '../stores';

import ContactListScreen from '../screens/contacts/ContactListScreen';
import AddContactScreen from '../screens/contacts/AddContactScreen';
import ContactProfileScreen from '../screens/contacts/ContactProfileScreen';
import QRScanScreen from '../screens/contacts/QRScanScreen';

const Stack = createNativeStackNavigator<ContactStackParamList>();

export default function ContactStack() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ContactList"
        component={ContactListScreen}
        options={{ title: 'Contacts' }}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{ title: 'Add Contact', presentation: 'modal' }}
      />
      <Stack.Screen
        name="ContactProfile"
        component={ContactProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="QRScan"
        component={QRScanScreen}
        options={{ title: 'Scan QR Code', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
