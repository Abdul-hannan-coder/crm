"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/deleted-items";
import type { DeletedItem } from "@/types";

export function useDeletedItems() {
  const { data, loading, error, refetch } = useApiData<DeletedItem[]>(
    api.getDeletedItems
  );
  return {
    deletedItems: data ?? [],
    loading,
    error,
    refetch,
    deleteDeletedItem: api.deleteDeletedItem,
    restoreDeletedItem: api.restoreDeletedItem,
  };
}
