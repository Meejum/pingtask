import { create } from 'zustand';
import { Contact } from '../types';

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  searchQuery: string;
  setContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  getFilteredContacts: () => Contact[];
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  isLoading: true,
  searchQuery: '',
  setContacts: (contacts) => set({ contacts, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  getFilteredContacts: () => {
    const { contacts, searchQuery } = get();
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.pin.toLowerCase().includes(q),
    );
  },
}));
