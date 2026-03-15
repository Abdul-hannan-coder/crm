"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/automations";
import type { Automation } from "@/types";

export function useAutomations() {
  const { data, loading, error, refetch } = useApiData<Automation[]>(
    api.getAutomations
  );
  return {
    automations: data ?? [],
    loading,
    error,
    refetch,
    createAutomation: api.createAutomation,
    updateAutomation: api.updateAutomation,
    deleteAutomation: api.deleteAutomation,
  };
}
