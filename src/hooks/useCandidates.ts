"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/candidates";
import type { Candidate } from "@/types";

export function useCandidates() {
  const { data, loading, error, refetch } = useApiData<Candidate[]>(
    api.getCandidates
  );
  return {
    candidates: data ?? [],
    loading,
    error,
    refetch,
    createCandidate: api.createCandidate,
    updateCandidate: api.updateCandidate,
    deleteCandidate: api.deleteCandidate,
  };
}
