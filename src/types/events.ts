export interface EventLog {
  id: string;
  actor_id: string | null;
  action: 'CASE_CREATED' | 'CASE_STATUS_CHANGED' | 'CONTRIBUTION_STATUS_CHANGED' | 'COMPLETION_VERIFIED';
  entity_type: 'cases' | 'contributions';
  entity_id: string;
  metadata: any;
  created_at: string;
  actor?: {
    name: string;
    role: string;
  };
}
