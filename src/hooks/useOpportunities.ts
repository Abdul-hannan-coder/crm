"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/opportunities";
import type { Opportunity } from "@/types";

export function useOpportunities() {
  const { data, loading, error, refetch } = useApiData<Opportunity[]>(
    api.getOpportunities
  );
  return {
    opportunities: data ?? [],
    loading,
    error,
    refetch,
    createOpportunity: api.createOpportunity,
    updateOpportunity: api.updateOpportunity,
    deleteOpportunity: api.deleteOpportunity,
  };
}
