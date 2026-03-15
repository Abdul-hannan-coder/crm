/**
 * Shared table config: headers and labels for Candidates, Contacts, Companies.
 * Used by MainDataTable, FilterModal, CustomizeTableModal, ImportCsvModal.
 */

export type TableModule = "candidates" | "contacts" | "companies";

const CANDIDATE_HEADERS = [
  "name",
  "email",
  "gender",
  "phone",
  "resume",
  "profile_updated_by_candidate_on",
  "profile_request_sent_on",
  "skills",
  "full_address",
  "city",
  "state",
  "country",
  "owner",
  "last_email_sent_on",
  "last_communication",
  "last_linkedin_message_sent_on",
  "postal_code",
  "work_history",
  "position_title",
  "current_organization",
  "total_experience",
  "locality",
  "summary",
];

const CONTACT_HEADERS = [
  "name",
  "facebook_profile_url",
  "twitter_profile_url",
  "linkedin_profile_url",
  "company_name",
  "email",
  "phone",
  "full_address",
  "city",
  "state",
  "country",
  "postal_code",
  "locality",
  "owner",
  "last_call_log_added",
  "last_communication",
  "last_linkedin_message_sent_on",
  "last_email_sent_on",
  "xing_profile_url",
  "hotlist",
  "job_title",
];

const COMPANY_HEADERS = [
  "name",
  "industry",
  "full_address",
  "website",
  "open_jobs",
  "closed_jobs",
  "on_hold_jobs",
  "cancelled_jobs",
  "owner",
  "hotlist",
];

export function getAllHeaders(module: TableModule): string[] {
  if (module === "candidates") return [...CANDIDATE_HEADERS];
  if (module === "contacts") return [...CONTACT_HEADERS];
  if (module === "companies") return [...COMPANY_HEADERS];
  return [];
}

const HEADER_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  gender: "Gender",
  phone: "Phone",
  resume: "Resume",
  profile_updated_by_candidate_on: "Profile Updated By Candidate On",
  profile_request_sent_on: "Profile Request Sent On",
  skills: "Skills",
  full_address: "Full Address",
  city: "City",
  state: "State",
  country: "Country",
  owner: "Owner",
  last_email_sent_on: "Last Email Sent On",
  last_communication: "Last Communication",
  last_linkedin_message_sent_on: "Last LinkedIn Message Sent On",
  postal_code: "Postal Code",
  work_history: "Work History",
  position_title: "Position/Title",
  current_organization: "Current Organization",
  total_experience: "Total Experience",
  locality: "Locality",
  summary: "Summary",
  company_name: "Company",
  facebook_profile_url: "Facebook Profile",
  twitter_profile_url: "Twitter Profile",
  linkedin_profile_url: "LinkedIn Profile",
  xing_profile_url: "Xing Profile",
  job_title: "Job Title",
  last_call_log_added: "Last Call Log Added",
  hotlist: "Hotlist",
  industry: "Industry",
  website: "Website",
  open_jobs: "Open Jobs",
  closed_jobs: "Closed Jobs",
  on_hold_jobs: "On Hold Jobs",
  cancelled_jobs: "Cancelled Jobs",
};

export function formatHeader(header: string): string {
  if (header === "id") return "ID";
  if (HEADER_LABELS[header]) return HEADER_LABELS[header];
  return header
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/** Default columns to hide per module (rest are visible). */
export const INITIAL_HIDDEN_COLUMNS: Record<TableModule, string[]> = {
  candidates: [
    "profile_updated_by_candidate_on",
    "profile_request_sent_on",
    "last_email_sent_on",
    "last_communication",
    "last_linkedin_message_sent_on",
    "postal_code",
    "work_history",
    "total_experience",
    "locality",
    "summary",
  ],
  contacts: [
    "facebook_profile_url",
    "twitter_profile_url",
    "xing_profile_url",
    "full_address",
    "city",
    "state",
    "country",
    "postal_code",
    "locality",
    "last_call_log_added",
    "last_communication",
    "last_linkedin_message_sent_on",
    "last_email_sent_on",
  ],
  companies: ["full_address", "open_jobs", "closed_jobs", "on_hold_jobs", "cancelled_jobs"],
};

export interface TableStateSlice {
  hiddenColumns: string[];
  pinnedColumns: string[];
  columnOrder: Record<string, string[]>;
}

/** Visible headers in display order (pinned first, then by column order, excluding hidden). */
export function getVisibleHeaders(
  module: TableModule,
  state: TableStateSlice
): string[] {
  const known = getAllHeaders(module);
  const order = state.columnOrder[module] || known;
  const all = order.filter(
    (h) => !state.hiddenColumns.includes(h) && known.includes(h)
  );
  const pinned = all.filter((h) => state.pinnedColumns.includes(h));
  const unpinned = all.filter((h) => !state.pinnedColumns.includes(h));
  return [...pinned, ...unpinned];
}
