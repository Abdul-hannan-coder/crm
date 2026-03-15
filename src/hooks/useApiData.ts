"use client";

import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL_MS = 10000;

export function useApiData<T>(
  fetchFn: () => Promise<T>,
  options?: { pollInterval?: number; enabled?: boolean }
) {
  const { pollInterval = POLL_INTERVAL_MS, enabled = true } = options ?? {};
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!enabled || !pollInterval) return;
    const id = setInterval(refetch, pollInterval);
    return () => clearInterval(id);
  }, [refetch, enabled, pollInterval]);

  return { data, loading, error, refetch };
}
