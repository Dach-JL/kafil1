import { supabase } from '../supabase/supabaseClient';
import { Contribution, ContributionSummary } from '../types/contributions';

export async function getCaseContributionSummaries(caseId: string): Promise<ContributionSummary[]> {
  if (!caseId) {
    console.warn('getCaseContributionSummaries: caseId is empty');
    return [];
  }

  // Use the RPC function to ensure security definer logic is applied
  const { data, error } = await supabase
    .rpc('get_case_contributions_for_owner', { target_case_id: caseId });

  if (error) {
    console.error('RPC Error (get_case_contributions_for_owner):', error);
    throw error;
  }
  return data as ContributionSummary[];
}

export async function createContribution(payload: {
  case_id: string;
  donor_id: string | null;
  amount: number;
  payment_proof_url: string;
  payment_proof_hash?: string;
}): Promise<Contribution> {
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      ...payload,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Contribution;
}

export async function getMyContributions(userId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*, cases(title, category, status)')
    .eq('donor_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Contribution[];
}

export async function getPendingContributions(): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*, cases(title), profiles:donor_id(name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Contribution[];
}

export async function verifyContribution(id: string, verifierId: string): Promise<void> {
  const { error } = await supabase
    .from('contributions')
    .update({ 
      status: 'VERIFIED',
      verified_by: verifierId
    })
    .eq('id', id)
    .eq('status', 'PENDING');

  if (error) throw error;
}

export async function rejectContribution(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('contributions')
    .update({ 
      status: 'REJECTED',
      rejection_reason: reason 
    })
    .eq('id', id)
    .eq('status', 'PENDING');

  if (error) throw error;
}
