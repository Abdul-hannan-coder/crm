"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/contacts";
import type { Contact } from "@/types";

export function useContacts() {
  const { data, loading, error, refetch } = useApiData<Contact[]>(
    api.getContacts
  );
  return {
    contacts: data ?? [],
    loading,
    error,
    refetch,
    createContact: api.createContact,
    updateContact: api.updateContact,
    deleteContact: api.deleteContact,
  };
}
