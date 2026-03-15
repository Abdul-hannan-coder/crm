import { api } from "./client";
import type { SmtpSetting } from "@/types";

export function getSmtpSettings() {
  return api.get<SmtpSetting[]>("/api/smtp-settings");
}

export function getSmtpSetting(id: string) {
  return api.get<SmtpSetting>(`/api/smtp-settings/${id}`);
}

export function createSmtpSetting(data: Partial<SmtpSetting>) {
  return api.post<SmtpSetting>("/api/smtp-settings", data);
}

export function updateSmtpSetting(id: string, data: Partial<SmtpSetting>) {
  return api.patch<SmtpSetting>(`/api/smtp-settings/${id}`, data);
}

export function deleteSmtpSetting(id: string) {
  return api.delete<{ ok: boolean }>(`/api/smtp-settings/${id}`);
}

export function testSmtpSetting(id: string) {
  return api.post<{ ok: boolean; message?: string }>("/api/smtp-settings/test", { id });
}
