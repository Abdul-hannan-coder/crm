export interface Opportunity {
  id: string;
  pipeline_id?: string;
  stage_id?: string;
  opp_name?: string;
  oppName?: string;
  contact_id?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  value?: number;
  owner?: string;
  business_name?: string;
  source?: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
