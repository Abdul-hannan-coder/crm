import { api } from "./client";
import type { Company } from "@/types";

export function getCompanies() {
  return api.get<Company[]>("/api/companies");
}

export function getCompany(id: string) {
  return api.get<Company>(`/api/companies/${id}`);
}

export function createCompany(data: Partial<Company>) {
  return api.post<Company>("/api/companies", data);
}

export function updateCompany(id: string, data: Partial<Company>) {
  return api.patch<Company>(`/api/companies/${id}`, data);
}

export function deleteCompany(id: string) {
  return api.delete<{ ok: boolean }>(`/api/companies/${id}`);
}
