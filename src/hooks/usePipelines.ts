"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/pipelines";
import type { Pipeline } from "@/types";

export function usePipelines() {
  const { data, loading, error, refetch } = useApiData<Pipeline[]>(
    api.getPipelines
  );
  return {
    pipelines: data ?? [],
    loading,
    error,
    refetch,
    createPipeline: api.createPipeline,
    updatePipeline: api.updatePipeline,
    deletePipeline: api.deletePipeline,
  };
}
