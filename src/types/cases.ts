// TypeScript types matching the Supabase cases schema

export type CaseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'ACTIVE_FUNDING'
  | 'FUNDED'
  | 'COMPLETED'
  | 'REJECTED';

export type CaseCategory =
  | 'MEDICAL'
  | 'EDUCATION'
  | 'EMERGENCY'
  | 'HOUSING'
  | 'FOOD'
  | 'OTHER';

export interface Case {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: CaseCategory;
  status: CaseStatus;
  target_amount: number;
  collected_amount: number;
  location?: string;
  completion_proof_url?: string;
  beneficiary_name: string;
  beneficiary_age?: number;
  urgency_level: number; // 1–5
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  funded_at?: string;
  completed_at?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    name: string;
    trust_score: number;
    role: string;
  };
}

// State machine transitions — used for validation before API calls
export const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: ['PENDING_REVIEW'],
  PENDING_REVIEW: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ACTIVE_FUNDING'],
  ACTIVE_FUNDING: ['FUNDED'],
  FUNDED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: ['DRAFT'], // allow re-submission after edits
};

export const STATUS_LABELS: Record<CaseStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  VERIFIED: 'Verified',
  ACTIVE_FUNDING: 'Accepting Contributions',
  FUNDED: 'Fully Funded',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  MEDICAL: '🏥 Medical',
  EDUCATION: '🎓 Education',
  EMERGENCY: '🚨 Emergency',
  HOUSING: '🏠 Housing',
  FOOD: '🍲 Food',
  OTHER: '📋 Other',
};
