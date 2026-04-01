import { create } from 'zustand';
import { Conversation, Message } from '../types';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  isLoading: boolean;
  setConversations: (convos: Conversation[]) => void;
  setCurrentMessages: (msgs: Message[]) => void;
  setLoading: (loading: boolean) => void;
  getUnreadTotal: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentMessages: [],
  isLoading: true,
  setConversations: (conversations) => set({ conversations, isLoading: false }),
  setCurrentMessages: (currentMessages) => set({ currentMessages }),
  setLoading: (isLoading) => set({ isLoading }),
  getUnreadTotal: () => {
    // Needs uid passed in via component — use selector instead
    return 0;
  },
}));
