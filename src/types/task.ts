export interface Task {
  id: string;
  title?: string;
  status?: string;
  related_to?: string;
  owner?: string;
  due_date?: string;
  added_on?: string;
  task_type?: string;
  added_by?: string;
  updated_on?: string;
  description?: string;
  collaborators?: string;
  associations?: string;
  reminder?: string;
  created_at?: string;
  [key: string]: unknown;
}
