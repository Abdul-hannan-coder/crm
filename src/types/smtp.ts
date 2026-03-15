export interface SmtpSetting {
  id: string;
  user_email?: string;
  smtp_from_name?: string;
  auth_type?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
