import { supabase } from '../supabase/supabaseClient';
import { Case, CaseCategory, CaseStatus } from '../types/cases';

// Fetch public cases (VERIFIED, ACTIVE_FUNDING, FUNDED, COMPLETED)
export async function getPublicCases(category?: CaseCategory): Promise<Case[]> {
  let query = supabase
    .from('cases')
    .select(`
      *,
      owner:profiles!owner_id(name, trust_score, role)
    `)
    .in('status', ['VERIFIED', 'ACTIVE_FUNDING'])
    .order('urgency_level', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Case[];
}

// Admin: Fetch all cases pending review
export async function getPendingCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'PENDING_REVIEW')
    .order('updated_at', { ascending: true }); // Oldest first

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
    .select(`
      *,
      owner:profiles!owner_id(name, trust_score, role)
    `)
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

// Case Owner: submit proof of case completion (Impact Report)
export async function submitCaseCompletionProof(
  id: string, 
  description: string, 
  images: string[],
  outcomeDate?: string,
  evidenceHashes?: string[]
): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ 
      completion_description: description,
      completion_images: images,
      completion_proof_url: images[0] || null, // Keep legacy field updated
      outcome_date: outcomeDate || new Date().toISOString(),
      impact_evidence_hashes: evidenceHashes || [],
      impact_report_status: 'PENDING',
    })
    .eq('id', id)
    .eq('status', 'FUNDED'); // Must be funded first

  if (error) throw error;
}

// Admin: Fetch all cases awaiting completion verification
export async function getPendingCompletionCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'FUNDED')
    .not('completion_proof_url', 'is', null) // Only fetch funded cases that uploaded a proof
    .order('updated_at', { ascending: true });

  if (error) throw error;
  return data as Case[];
}

// Admin: Verify the impact report (completion proof) and finalize the case
export async function verifyCaseCompletion(id: string, verifierId: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ 
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      impact_report_status: 'APPROVED',
      impact_approved_by: verifierId,
      impact_approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'FUNDED');

  if (error) throw error;
}
