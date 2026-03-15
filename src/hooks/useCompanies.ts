"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/companies";
import type { Company } from "@/types";

export function useCompanies() {
  const { data, loading, error, refetch } = useApiData<Company[]>(
    api.getCompanies
  );
  return {
    companies: data ?? [],
    loading,
    error,
    refetch,
    createCompany: api.createCompany,
    updateCompany: api.updateCompany,
    deleteCompany: api.deleteCompany,
  };
}
