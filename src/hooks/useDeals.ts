"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/deals";
import type { Deal } from "@/types";

export function useDeals() {
  const { data, loading, error, refetch } = useApiData<Deal[]>(api.getDeals);
  return {
    deals: data ?? [],
    loading,
    error,
    refetch,
    createDeal: api.createDeal,
    updateDeal: api.updateDeal,
    deleteDeal: api.deleteDeal,
    bulkDeleteDeals: api.bulkDeleteDeals,
  };
}
