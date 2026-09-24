// ============================================================================
// Nachrichten zwischen Coach (Admin) und Kunde
// ============================================================================

import { supabaseClient } from './supabase-client.js';

export async function getAdminId() {
  const { data, error } = await supabaseClient.from('profiles').select('id').eq('role', 'admin').limit(1).maybeSingle();
  return { data: data ? data.id : null, error };
}

export async function listConversation(userIdA, userIdB) {
  return supabaseClient
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userIdA},recipient_id.eq.${userIdB}),and(sender_id.eq.${userIdB},recipient_id.eq.${userIdA})`)
    .order('created_at', { ascending: true });
}

export async function sendMessage({ senderId, recipientId, body, serviceContext }) {
  return supabaseClient.from('messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    body,
    service_context: serviceContext || null,
  });
}

export async function markConversationRead(otherUserId, myId) {
  return supabaseClient
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherUserId)
    .eq('recipient_id', myId)
    .eq('is_read', false);
}

/**
 * Für die Admin-Ansicht: Liste aller Kunden mit Anzahl ungelesener Nachrichten
 * und Zeitpunkt der letzten Nachricht, um Konversationen zu priorisieren.
 */
export async function listClientsWithMessageInfo(adminId) {
  const [{ data: clients, error: clientsError }, { data: messages, error: messagesError }] = await Promise.all([
    supabaseClient.from('profiles').select('id, full_name, email').eq('role', 'client').order('full_name', { ascending: true }),
    supabaseClient.from('messages').select('*').or(`sender_id.eq.${adminId},recipient_id.eq.${adminId}`),
  ]);
  if (clientsError) return { data: null, error: clientsError };
  if (messagesError) return { data: null, error: messagesError };

  const info = new Map();
  (messages || []).forEach((m) => {
    const otherId = m.sender_id === adminId ? m.recipient_id : m.sender_id;
    if (!info.has(otherId)) info.set(otherId, { lastMessageAt: null, unread: 0 });
    const entry = info.get(otherId);
    if (!entry.lastMessageAt || new Date(m.created_at) > new Date(entry.lastMessageAt)) {
      entry.lastMessageAt = m.created_at;
    }
    if (m.recipient_id === adminId && !m.is_read) entry.unread += 1;
  });

  const merged = (clients || []).map((c) => ({
    ...c,
    lastMessageAt: info.has(c.id) ? info.get(c.id).lastMessageAt : null,
    unread: info.has(c.id) ? info.get(c.id).unread : 0,
  }));
  merged.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });

  return { data: merged, error: null };
}
