import { FirestoreTimestamp } from './common';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  sourceMessageId: string;
  sourceConversationId: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  participants: string[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  completedAt: FirestoreTimestamp | null;
}
