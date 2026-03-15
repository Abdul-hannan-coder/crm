export interface Contact {
  id: string;
  name?: string;
  facebook_profile_url?: string;
  twitter_profile_url?: string;
  linkedin_profile_url?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  full_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  locality?: string;
  owner?: string;
  last_call_log_added?: string;
  last_communication?: string;
  last_linkedin_message_sent_on?: string;
  last_email_sent_on?: string;
  xing_profile_url?: string;
  hotlist?: string;
  job_title?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
