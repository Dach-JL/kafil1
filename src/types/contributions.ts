import { Case } from './cases';

export type ContributionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Contribution {
  id: string;
  case_id: string;
  donor_id: string | null;
  amount: number;
  status: ContributionStatus;
  payment_proof_url: string;
  payment_proof_hash?: string;
  rejection_reason?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined relation fields for admin/user views
  cases?: Partial<Case>;
  donor?: {
    name: string;
    email?: string;
  };
}
export interface ContributionSummary {
  id: string;
  case_id: string;
  amount: number;
  status: ContributionStatus;
  created_at: string;
}
