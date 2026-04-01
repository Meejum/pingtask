import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskStackParamList, Task, TaskStatus } from '../../types';
import { useThemeStore, useAuthStore } from '../../stores';
import { useTaskStore } from '../../stores/taskStore';
import { subscribeToTasks } from '../../services/taskService';
import { spacing, typography, layout } from '../../constants';
import { Avatar } from '../../components/common';

type Props = {
  navigation: NativeStackNavigationProp<TaskStackParamList, 'TaskList'>;
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  todo: { label: 'To Do', icon: 'ellipse-outline', color: '#9E9E9E' },
  in_progress: { label: 'In Progress', icon: 'time-outline', color: '#FF9800' },
  done: { label: 'Done', icon: 'checkmark-circle', color: '#4CAF50' },
};

type FilterKey = 'all' | TaskStatus;

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function TaskListScreen({ navigation }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const { tasks, filter, setTasks, setFilter, getFilteredTasks } = useTaskStore();

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToTasks(user.uid, setTasks);
    return unsub;
  }, [user?.uid, setTasks]);

  const filtered = getFilteredTasks();

  if (tasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkbox-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tasks</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            @mention someone in a chat to assign them a task
          </Text>
          <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="bulb-outline" size={20} color={colors.accentLight} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Try typing "@Ali please review the design" in a chat
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'Active' },
    { key: 'done', label: 'Done' },
  ];

  const renderTask = ({ item: task }: { item: Task }) => {
    const cfg = STATUS_CONFIG[task.status];
    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
        activeOpacity={0.6}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={[styles.taskDate, { color: colors.textTertiary }]}>{formatDate(task.createdAt)}</Text>
        </View>
        <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>{task.title}</Text>
        <View style={styles.taskFooter}>
          <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.taskAssignee, { color: colors.textSecondary }]}>
            {task.assignedToName}
          </Text>
          <Ionicons name="arrow-forward-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.taskAssignee, { color: colors.textSecondary }]}>
            by {task.assignedByName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              { backgroundColor: filter === f.key ? colors.accentLight : colors.surface },
            ]}
            onPress={() => setFilter(f.key as any)}
          >
            <Text style={[styles.filterLabel, { color: filter === f.key ? '#FFFFFF' : colors.text }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.sm, gap: spacing.sm },
  filterTab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: layout.borderRadius.full },
  filterLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  list: { padding: layout.screenPadding, gap: spacing.md },
  taskCard: { padding: spacing.lg, borderRadius: layout.borderRadius.lg },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: layout.borderRadius.full },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  taskDate: { fontSize: typography.fontSize.xs },
  taskTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, marginBottom: spacing.sm },
  taskFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  taskAssignee: { fontSize: typography.fontSize.xs },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: layout.screenPadding },
  iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxl },
  emptyTitle: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: typography.fontSize.md, textAlign: 'center', marginBottom: spacing.xxl },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: layout.borderRadius.md, maxWidth: 300 },
  tipText: { flex: 1, fontSize: typography.fontSize.sm, lineHeight: 18 },
});
