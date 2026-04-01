import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { useThemeStore, useAuthStore } from '../stores';
import { useChatStore } from '../stores/chatStore';
import { useTaskStore } from '../stores/taskStore';
import { subscribeToConversations } from '../services/chatService';
import { subscribeToTasks } from '../services/taskService';
import { layout } from '../constants';

import ChatStack from './ChatStack';
import ContactStack from './ContactStack';
import TaskStack from './TaskStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { conversations, setConversations, getUnreadTotal } = useChatStore();
  const { tasks, setTasks } = useTaskStore();

  // Subscribe to conversations and tasks globally
  useEffect(() => {
    if (!user?.uid) return;
    const unsub1 = subscribeToConversations(user.uid, setConversations);
    const unsub2 = subscribeToTasks(user.uid, setTasks);
    return () => { unsub1(); unsub2(); };
  }, [user?.uid, setConversations, setTasks]);

  const unreadCount = user?.uid ? getUnreadTotal(user.uid) : 0;
  const todoCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accentLight, color: '#FFF', fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="ContactTab"
        component={ContactStack}
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TaskTab"
        component={TaskStack}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
          tabBarBadge: todoCount > 0 ? todoCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF9800', color: '#FFF', fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
