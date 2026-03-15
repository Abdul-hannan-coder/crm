import { api } from "./client";
import type { Deal } from "@/types";

export function getDeals() {
  return api.get<Deal[]>("/api/deals");
}

export function getDeal(id: string) {
  return api.get<Deal>(`/api/deals/${id}`);
}

export function createDeal(data: Partial<Deal>) {
  return api.post<Deal>("/api/deals", data);
}

export function updateDeal(id: string, data: Partial<Deal>) {
  return api.patch<Deal>(`/api/deals/${id}`, data);
}

export function deleteDeal(id: string) {
  return api.delete<{ ok: boolean }>(`/api/deals/${id}`);
}

export function bulkDeleteDeals(ids: string[]) {
  return api.post<{ ok: boolean }>("/api/deals/bulk-delete", { ids });
}
