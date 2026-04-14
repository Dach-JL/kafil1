import { supabase } from '../supabase/supabaseClient';
import { EventLog } from '../types/events';

/**
 * Fetch all event logs for a given case, ordered chronologically.
 * Includes events directly on the case AND contribution events for the case.
 */
export async function getCaseTimeline(caseId: string): Promise<EventLog[]> {
  // Fetch both direct case events and contribution events linked to this case
  const { data, error } = await supabase
    .from('event_logs')
    .select(`
      *,
      actor:profiles(name, role)
    `)
    .or(`entity_id.eq.${caseId},metadata->>case_id.eq.${caseId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as EventLog[];
}
