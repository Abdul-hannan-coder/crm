export interface Candidate {
  id: string;
  name?: string;
  email?: string;
  gender?: string;
  phone?: string;
  resume?: string;
  profile_updated_by_candidate_on?: string;
  profile_request_sent_on?: string;
  skills?: string;
  full_address?: string;
  city?: string;
  state?: string;
  country?: string;
  owner?: string;
  last_email_sent_on?: string;
  last_communication?: string;
  last_linkedin_message_sent_on?: string;
  postal_code?: string;
  work_history?: string;
  position_title?: string;
  current_organization?: string;
  total_experience?: string;
  locality?: string;
  summary?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
