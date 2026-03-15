import { api } from "./client";
import type { Task } from "@/types";

export function getTasks() {
  return api.get<Task[]>("/api/tasks");
}

export function getTask(id: string) {
  return api.get<Task>(`/api/tasks/${id}`);
}

export function createTask(data: Partial<Task>) {
  return api.post<Task>("/api/tasks", data);
}

export function updateTask(id: string, data: Partial<Task>) {
  return api.patch<Task>(`/api/tasks/${id}`, data);
}

export function deleteTask(id: string) {
  return api.delete<{ ok: boolean }>(`/api/tasks/${id}`);
}

export function bulkDeleteTasks(ids: string[]) {
  return api.post<{ ok: boolean }>("/api/tasks/bulk-delete", { ids });
}
