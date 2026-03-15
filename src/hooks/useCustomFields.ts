"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/custom-fields";
import type { CustomField } from "@/types";

export function useCustomFields() {
  const { data, loading, error, refetch } = useApiData<CustomField[]>(
    api.getCustomFields
  );
  return {
    customFields: data ?? [],
    loading,
    error,
    refetch,
    createCustomField: api.createCustomField,
  };
}
