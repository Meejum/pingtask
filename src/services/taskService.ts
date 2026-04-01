import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, TaskStatus } from '../types';

export function subscribeToTasks(
  uid: string,
  onUpdate: (tasks: Task[]) => void,
) {
  const q = query(
    collection(db, 'tasks'),
    where('participants', 'array-contains', uid),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Task[];
    onUpdate(tasks);
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'done') updates.completedAt = serverTimestamp();
  if (status !== 'done') updates.completedAt = null;

  await updateDoc(doc(db, 'tasks', taskId), updates);
}

export async function getTask(taskId: string): Promise<Task | null> {
  const d = await getDoc(doc(db, 'tasks', taskId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as Task;
}
