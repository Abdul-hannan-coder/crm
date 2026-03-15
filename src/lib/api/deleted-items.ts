import { api } from "./client";
import type { DeletedItem } from "@/types";

export function getDeletedItems() {
  return api.get<DeletedItem[]>("/api/deleted-items");
}

export function getDeletedItem(id: string) {
  return api.get<DeletedItem>(`/api/deleted-items/${id}`);
}

export function createDeletedItem(data: Partial<DeletedItem>) {
  return api.post<DeletedItem>("/api/deleted-items", data);
}

export function deleteDeletedItem(id: string) {
  return api.delete<{ ok: boolean }>(`/api/deleted-items/${id}`);
}

export function restoreDeletedItem(id: string) {
  return api.post<{ ok: boolean }>("/api/restore", { id });
}
