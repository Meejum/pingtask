import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { TaskStackParamList, Task, TaskStatus } from '../../types';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';
import { Avatar, LoadingScreen } from '../../components/common';
import { showAlert } from '../../utils/alert';

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskDetail'>;

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  todo: { label: 'To Do', icon: 'ellipse-outline', color: '#9E9E9E' },
  in_progress: { label: 'In Progress', icon: 'time-outline', color: '#FF9800' },
  done: { label: 'Done', icon: 'checkmark-circle', color: '#4CAF50' },
};

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return 'Unknown';
  return timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskDetailScreen({ route }: Props) {
  const { taskId } = route.params;
  const colors = useThemeStore((s) => s.colors);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(db, 'tasks', taskId));
      if (d.exists()) setTask({ id: d.id, ...d.data() } as Task);
      setLoading(false);
    })();
  }, [taskId]);

  const updateStatus = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const updates: Record<string, any> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (newStatus === 'done') updates.completedAt = serverTimestamp();
      if (newStatus !== 'done') updates.completedAt = null;

      await updateDoc(doc(db, 'tasks', task.id), updates);
      setTask({ ...task, status: newStatus });
    } catch (e: any) {
      showAlert('Error', e.message);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!task) return <LoadingScreen message="Task not found" />;

  const statusCfg = STATUS_CONFIG[task.status];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '20' }]}>
        <Ionicons name={statusCfg.icon} size={18} color={statusCfg.color} />
        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>

      {task.description && task.description !== task.title && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{task.description}</Text>
      )}

      {/* People */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
          <Ionicons name="person-outline" size={20} color={colors.accentLight} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Assigned To</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{task.assignedToName}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="arrow-forward-outline" size={20} color={colors.accentLight} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Assigned By</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{task.assignedByName}</Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.accentLight} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Created</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(task.createdAt)}</Text>
          </View>
        </View>
        {task.completedAt && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Completed</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(task.completedAt)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Status Actions */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Change Status</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof statusCfg][]).map(([key, cfg]) => (
          <TouchableOpacity
            key={key}
            style={[styles.statusRow, { borderBottomColor: colors.borderLight }]}
            onPress={() => updateStatus(key)}
            activeOpacity={0.6}
          >
            <Ionicons name={cfg.icon} size={20} color={cfg.color} />
            <Text style={[styles.statusRowLabel, { color: colors.text }]}>{cfg.label}</Text>
            {task.status === key && (
              <Ionicons name="checkmark" size={20} color={colors.accentLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 40 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: layout.borderRadius.full,
    marginBottom: spacing.lg,
  },
  statusText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  description: { fontSize: typography.fontSize.md, lineHeight: 22, marginBottom: spacing.xxl },
  sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
  section: { borderRadius: layout.borderRadius.lg, overflow: 'hidden', marginBottom: spacing.xxl },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: typography.fontSize.xs },
  infoValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  statusRowLabel: { flex: 1, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
});
