import { api } from "./client";
import type { Contact } from "@/types";

export function getContacts() {
  return api.get<Contact[]>("/api/contacts");
}

export function getContact(id: string) {
  return api.get<Contact>(`/api/contacts/${id}`);
}

export function createContact(data: Partial<Contact>) {
  return api.post<Contact>("/api/contacts", data);
}

export function updateContact(id: string, data: Partial<Contact>) {
  return api.patch<Contact>(`/api/contacts/${id}`, data);
}

export function deleteContact(id: string) {
  return api.delete<{ ok: boolean }>(`/api/contacts/${id}`);
}
