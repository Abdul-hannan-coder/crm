import { api } from "./client";
import type { CustomField } from "@/types";

export function getCustomFields() {
  return api.get<CustomField[]>("/api/custom-fields");
}

export function createCustomField(data: Partial<CustomField>) {
  return api.post<CustomField>("/api/custom-fields", data);
}
