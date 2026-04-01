import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact, Conversation, Message } from '../types';

export interface SearchResults {
  contacts: Contact[];
  conversations: Conversation[];
  messages: (Message & { conversationTitle: string })[];
}

export async function globalSearch(
  uid: string,
  searchQuery: string,
  contacts: Contact[],
  conversations: Conversation[],
): Promise<SearchResults> {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return { contacts: [], conversations: [], messages: [] };

  // Search contacts (client-side from cached list)
  const matchedContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(q) ||
      c.pin.toLowerCase().includes(q),
  );

  // Search conversations (client-side from cached list)
  const getConvoTitle = (convo: Conversation) => {
    if (convo.type === 'group') return convo.groupName || 'Group';
    const otherUid = convo.participantUids.find((u) => u !== uid);
    if (otherUid && convo.participants[otherUid]) {
      return convo.participants[otherUid].displayName;
    }
    return 'Chat';
  };

  const matchedConvos = conversations.filter((c) =>
    getConvoTitle(c).toLowerCase().includes(q),
  );

  // Search messages across conversations (Firestore query per convo — limited)
  const matchedMessages: (Message & { conversationTitle: string })[] = [];

  // Search up to 5 conversations for messages containing the query
  const searchConvos = conversations.slice(0, 10);
  for (const convo of searchConvos) {
    try {
      const msgQuery = query(
        collection(db, `conversations/${convo.id}/messages`),
        orderBy('createdAt', 'desc'),
        limit(50),
      );
      const snap = await getDocs(msgQuery);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.text && data.text.toLowerCase().includes(q) && !data.encrypted) {
          matchedMessages.push({
            id: d.id,
            conversationId: convo.id,
            conversationTitle: getConvoTitle(convo),
            ...data,
          } as any);
        }
      });
    } catch {}
  }

  return {
    contacts: matchedContacts.slice(0, 10),
    conversations: matchedConvos.slice(0, 10),
    messages: matchedMessages.slice(0, 20),
  };
}
