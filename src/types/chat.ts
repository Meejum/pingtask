import { FirestoreTimestamp } from './common';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';
export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Participant {
  displayName: string;
  avatarUrl: string | null;
  role: 'admin' | 'member';
  joinedAt: FirestoreTimestamp;
}

export interface LastMessage {
  text: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  timestamp: FirestoreTimestamp;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participantUids: string[];
  participants: Record<string, Participant>;
  groupName: string | null;
  groupAvatarUrl: string | null;
  createdBy: string;
  lastMessage: LastMessage | null;
  unreadCount: Record<string, number>;
  typing: Record<string, boolean>;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface DeliveryEntry {
  status: 'sent' | 'delivered' | 'read';
  deliveredAt: FirestoreTimestamp | null;
  readAt: FirestoreTimestamp | null;
}

export interface MentionData {
  uid: string;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  fileName: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
  mentions: MentionData[];
  deliveryStatus: Record<string, DeliveryEntry>;
  aggregateStatus: MessageDeliveryStatus;
  createdAt: FirestoreTimestamp;
  editedAt: FirestoreTimestamp | null;
  isDeleted: boolean;
}
