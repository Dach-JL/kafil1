import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { ChatRoom, getMyChatRooms, ChatMessage } from '../api/chat';

interface ChatContextType {
  rooms: ChatRoom[];
  loading: boolean;
  unreadMessagesCount: number;
  refreshRooms: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple unread count for demonstration (can be refined with actual message flags)
  const unreadMessagesCount = rooms.reduce((acc, room) => acc + (room.latest_message && !room.latest_message.is_read ? 1 : 0), 0);

  async function fetchRooms() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getMyChatRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }

    fetchRooms();

    // Subscribe to new messages globally
    const messageChannel = supabase
      .channel('global:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Refresh rooms list to update 'last_message_at' and preview
          fetchRooms();
        }
      )
      .subscribe();

    // Subscribe to room changes (e.g., being added to a new room)
    const roomChannel = supabase
      .channel('global:rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        loading,
        unreadMessagesCount,
        refreshRooms: fetchRooms,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
