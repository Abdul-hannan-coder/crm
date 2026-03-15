import { api } from "./client";
import type { Automation } from "@/types";

export function getAutomations() {
  return api.get<Automation[]>("/api/automations");
}

export function getAutomation(id: string) {
  return api.get<Automation>(`/api/automations/${id}`);
}

export function createAutomation(data: Partial<Automation>) {
  return api.post<Automation>("/api/automations", data);
}

export function updateAutomation(id: string, data: Partial<Automation>) {
  return api.patch<Automation>(`/api/automations/${id}`, data);
}

export function deleteAutomation(id: string) {
  return api.delete<{ ok: boolean }>(`/api/automations/${id}`);
}
