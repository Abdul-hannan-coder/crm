"use client";

import { useApiData } from "./useApiData";
import * as api from "@/lib/api/tasks";
import type { Task } from "@/types";

export function useTasks() {
  const { data, loading, error, refetch } = useApiData<Task[]>(api.getTasks);
  return {
    tasks: data ?? [],
    loading,
    error,
    refetch,
    createTask: api.createTask,
    updateTask: api.updateTask,
    deleteTask: api.deleteTask,
    bulkDeleteTasks: api.bulkDeleteTasks,
  };
}
