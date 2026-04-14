import { supabase } from '../supabase/supabaseClient';
import { Case, CaseCategory, CaseStatus } from '../types/cases';

// Fetch public cases (VERIFIED, ACTIVE_FUNDING, FUNDED, COMPLETED)
export async function getPublicCases(category?: CaseCategory): Promise<Case[]> {
  let query = supabase
    .from('cases')
    .select('*')
    .in('status', ['VERIFIED', 'ACTIVE_FUNDING', 'FUNDED', 'COMPLETED'])
    .order('urgency_level', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Case[];
}

// Fetch cases owned by the current user
export async function getMyCases(userId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Case[];
}

// Get a single case by ID
export async function getCaseById(id: string): Promise<Case | null> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Case;
}

// Create a new case (starts in DRAFT)
export async function createCase(payload: Omit<Case, 'id' | 'status' | 'collected_amount' | 'created_at' | 'updated_at'>): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .insert({ ...payload, status: 'DRAFT', collected_amount: 0 })
    .select()
    .single();

  if (error) throw error;
  return data as Case;
}

// Submit a DRAFT case for admin review
export async function submitCaseForReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ status: 'PENDING_REVIEW' })
    .eq('id', id)
    .eq('status', 'DRAFT'); // Guard: can only submit from DRAFT

  if (error) throw error;
}

// Admin: verify a case
export async function verifyCase(id: string, verifierId: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({
      status: 'ACTIVE_FUNDING',
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'PENDING_REVIEW');

  if (error) throw error;
}

// Admin: reject a case
export async function rejectCase(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ status: 'REJECTED', rejection_reason: reason })
    .eq('id', id)
    .eq('status', 'PENDING_REVIEW');

  if (error) throw error;
}
