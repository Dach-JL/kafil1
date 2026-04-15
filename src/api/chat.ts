import { supabase } from '../supabase/supabaseClient';

export interface ChatRoom {
  id: string;
  case_id?: string;
  is_reported: boolean;
  created_at: string;
  last_message_at: string;
  // Joined data
  participants: {
    user_id: string;
    profile: {
      name: string;
      avatar_url: string;
    };
  }[];
  latest_message?: ChatMessage;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Fetch all chat rooms for the current user
 */
export async function getMyChatRooms(): Promise<ChatRoom[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      participants:chat_participants(
        user_id,
        profile:profiles(name, avatar_url)
      )
    `)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  
  // Fetch latest message for each room (optional optimization later)
  return data as any[];
}

/**
 * Fetch messages for a specific room
 */
export async function getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ChatMessage[];
}

/**
 * Send a new message
 */
export async function sendMessage(roomId: string, senderId: string, content: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content: content.trim()
    })
    .select()
    .single();

  if (error) throw error;

  // Update room's last_message_at
  await supabase
    .from('chat_rooms')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', roomId);

  return data as ChatMessage;
}

/**
 * Start or retrieve a chat room for a specific case between two users
 */
export async function getOrCreateChatRoom(caseId: string, otherUserId: string): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const myUserId = user.user.id;

  // 1. Check if a room exists for this case with both participants
  const { data: existingRooms, error: searchError } = await supabase
    .from('chat_participants')
    .select('room_id')
    .eq('user_id', myUserId);

  if (searchError) throw searchError;

  if (existingRooms && existingRooms.length > 0) {
    const roomIds = existingRooms.map(r => r.room_id);
    
    // Find a room in those roomIds that also has the other user and the same caseId
    const { data: matchingRooms, error: matchError } = await supabase
      .from('chat_rooms')
      .select('id')
      .in('id', roomIds)
      .eq('case_id', caseId)
      .single();

    if (!matchError && matchingRooms) {
      return matchingRooms.id;
    }
  }

  // 2. Create new room if none exists
  const { data: newRoom, error: roomError } = await supabase
    .from('chat_rooms')
    .insert({ case_id: caseId })
    .select()
    .single();

  if (roomError) throw roomError;

  // 3. Add participants
  const { error: partError } = await supabase
    .from('chat_participants')
    .insert([
      { room_id: newRoom.id, user_id: myUserId },
      { room_id: newRoom.id, user_id: otherUserId }
    ]);

  if (partError) throw partError;

  return newRoom.id;
}

/**
 * Report a chat room
 */
export async function reportChatRoom(roomId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('chat_rooms')
    .update({ 
      is_reported: true, 
      report_reason: reason,
      reported_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (error) throw error;
}
