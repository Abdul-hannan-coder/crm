export interface PipelineStage {
  id: string;
  name: string;
  funnel?: boolean;
  dist?: boolean;
}

export interface Pipeline {
  id: string;
  name?: string;
  stages?: PipelineStage[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
