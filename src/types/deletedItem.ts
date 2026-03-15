export interface DeletedItem {
  id: string;
  original_data: Record<string, unknown>;
  original_collection: string;
  deleted_at?: string;
  created_at?: string;
  [key: string]: unknown;
}
