export interface Company {
  id: string;
  name?: string;
  industry?: string;
  full_address?: string;
  website?: string;
  open_jobs?: number;
  closed_jobs?: number;
  on_hold_jobs?: number;
  cancelled_jobs?: number;
  owner?: string;
  hotlist?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
