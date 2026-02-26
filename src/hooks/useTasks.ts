"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Task, TaskFilters } from "@/lib/types";

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const etagRef = useRef<string>("");

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters?.assignee && filters.assignee !== "all")
        params.set("assignee", filters.assignee);
      if (filters?.repo && filters.repo !== "all")
        params.set("repo", filters.repo);
      if (filters?.priority && filters.priority !== "all")
        params.set("priority", filters.priority);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      setTasks(data.tasks);
      etagRef.current = data.etag;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters?.assignee, filters?.repo, filters?.priority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (
      task: Partial<Task>
    ): Promise<{ success: boolean; needsAuth?: boolean }> => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });

        if (res.status === 401) return { success: false, needsAuth: true };
        if (res.status === 409) {
          await fetchTasks();
          return createTask(task);
        }
        if (!res.ok) throw new Error("Failed to create task");

        await fetchTasks();
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (
      id: string,
      updates: Partial<Task>
    ): Promise<{ success: boolean; needsAuth?: boolean }> => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (res.status === 401) return { success: false, needsAuth: true };
        if (res.status === 409) {
          await fetchTasks();
          return updateTask(id, updates);
        }
        if (!res.ok) throw new Error("Failed to update task");

        await fetchTasks();
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (
      id: string
    ): Promise<{ success: boolean; needsAuth?: boolean }> => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });

        if (res.status === 401) return { success: false, needsAuth: true };
        if (res.status === 409) {
          await fetchTasks();
          return deleteTask(id);
        }
        if (!res.ok) throw new Error("Failed to delete task");

        await fetchTasks();
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
