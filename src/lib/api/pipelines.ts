import { api } from "./client";
import type { Pipeline } from "@/types";

export function getPipelines() {
  return api.get<Pipeline[]>("/api/pipelines");
}

export function getPipeline(id: string) {
  return api.get<Pipeline>(`/api/pipelines/${id}`);
}

export function createPipeline(data: Partial<Pipeline>) {
  return api.post<Pipeline>("/api/pipelines", data);
}

export function updatePipeline(id: string, data: Partial<Pipeline>) {
  return api.patch<Pipeline>(`/api/pipelines/${id}`, data);
}

export function deletePipeline(id: string) {
  return api.delete<{ ok: boolean }>(`/api/pipelines/${id}`);
}
