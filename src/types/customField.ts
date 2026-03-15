export interface CustomField {
  id: string;
  fieldName?: string;
  fieldType?: string;
  module?: string;
  created_at?: string;
  [key: string]: unknown;
}
