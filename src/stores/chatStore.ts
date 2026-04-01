import { create } from 'zustand';
import { Conversation, Message } from '../types';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  isLoading: boolean;
  setConversations: (convos: Conversation[]) => void;
  setCurrentMessages: (msgs: Message[]) => void;
  setLoading: (loading: boolean) => void;
  getUnreadTotal: (uid: string) => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentMessages: [],
  isLoading: true,
  setConversations: (conversations) => set({ conversations, isLoading: false }),
  setCurrentMessages: (currentMessages) => set({ currentMessages }),
  setLoading: (isLoading) => set({ isLoading }),
  getUnreadTotal: (uid: string) => {
    return get().conversations.reduce((total, convo) => {
      return total + (convo.unreadCount?.[uid] || 0);
    }, 0);
  },
}));
