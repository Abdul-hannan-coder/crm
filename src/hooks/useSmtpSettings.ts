"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/smtp-settings";
import type { SmtpSetting } from "@/types";

export function useSmtpSettings() {
  const { data, loading, error, refetch } = useApiData<SmtpSetting[]>(
    api.getSmtpSettings
  );
  return {
    smtpSettings: data ?? [],
    loading,
    error,
    refetch,
    createSmtpSetting: api.createSmtpSetting,
    updateSmtpSetting: api.updateSmtpSetting,
    deleteSmtpSetting: api.deleteSmtpSetting,
  };
}
