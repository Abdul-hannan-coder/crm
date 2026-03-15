import { api } from "./client";
import type { Opportunity } from "@/types";

export function getOpportunities() {
  return api.get<Opportunity[]>("/api/opportunities");
}

export function getOpportunity(id: string) {
  return api.get<Opportunity>(`/api/opportunities/${id}`);
}

export function createOpportunity(data: Partial<Opportunity>) {
  return api.post<Opportunity>("/api/opportunities", data);
}

export function updateOpportunity(id: string, data: Partial<Opportunity>) {
  return api.patch<Opportunity>(`/api/opportunities/${id}`, data);
}

export function deleteOpportunity(id: string) {
  return api.delete<{ ok: boolean }>(`/api/opportunities/${id}`);
}
