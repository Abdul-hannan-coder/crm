export interface Deal {
  id: string;
  name?: string;
  stage?: string;
  value?: number;
  weighted_value?: number;
  deal_type?: string;
  company?: string;
  job?: string;
  candidate_name?: string;
  collaborator?: string;
  contact?: string;
  owner?: string;
  close_date?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
