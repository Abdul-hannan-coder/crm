import { api } from "./client";
import type { Candidate } from "@/types";

export function getCandidates() {
  return api.get<Candidate[]>("/api/candidates");
}

export function getCandidate(id: string) {
  return api.get<Candidate>(`/api/candidates/${id}`);
}

export function createCandidate(data: Partial<Candidate>) {
  return api.post<Candidate>("/api/candidates", data);
}

export function updateCandidate(id: string, data: Partial<Candidate>) {
  return api.patch<Candidate>(`/api/candidates/${id}`, data);
}

export function deleteCandidate(id: string) {
  return api.delete<{ ok: boolean }>(`/api/candidates/${id}`);
}
