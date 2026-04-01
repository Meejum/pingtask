import { create } from 'zustand';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  filter: 'all' | 'todo' | 'in_progress' | 'done';
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: (filter: TaskState['filter']) => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: true,
  filter: 'all',
  setTasks: (tasks) => set({ tasks, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilter: (filter) => set({ filter }),
  getFilteredTasks: () => {
    const { tasks, filter } = get();
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  },
}));
