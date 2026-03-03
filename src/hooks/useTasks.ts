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
      if (filters?.client && filters.client !== "all")
        params.set("client", filters.client);

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
  }, [filters?.assignee, filters?.repo, filters?.priority, filters?.client]);

  useEffect(() => {
    fetchTasks();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchTasks, 30_000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const createTask = useCallback(
    async (
      task: Partial<Task>
    ): Promise<{ success: boolean }> => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });

        
        if (res.status === 409) {
          await fetchTasks();
          return createTask(task);
        }
        if (!res.ok) throw new Error("Failed to create task");

        const data = await res.json();
        // Optimistic update: add the new task to local state immediately
        setTasks((prev) => [...prev, data.task]);
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
    ): Promise<{ success: boolean }> => {
      // Apply optimistic update and capture snapshot for rollback
      let snapshot: Task[] = [];
      setTasks((prev) => {
        snapshot = prev;
        return prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      });

      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (res.status === 409) {
          await fetchTasks();
          return updateTask(id, updates);
        }
        if (!res.ok) throw new Error("Failed to update task");

        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? data.task : t))
        );
        return { success: true };
      } catch (err) {
        // Rollback on failure
        if (snapshot.length) setTasks(snapshot);
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (
      id: string
    ): Promise<{ success: boolean }> => {
      // Apply optimistic delete and capture snapshot for rollback
      let snapshot: Task[] = [];
      setTasks((prev) => {
        snapshot = prev;
        return prev.filter((t) => t.id !== id);
      });

      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });

        if (res.status === 409) {
          await fetchTasks();
          return deleteTask(id);
        }
        if (!res.ok) throw new Error("Failed to delete task");

        return { success: true };
      } catch (err) {
        // Rollback on failure
        if (snapshot.length) setTasks(snapshot);
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  const addComment = useCallback(
    async (
      taskId: string,
      comment: { author: string; content: string }
    ): Promise<{ success: boolean }> => {
      try {
        const res = await fetch(`/api/tasks/${taskId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment),
        });

        
        if (res.status === 409) {
          await fetchTasks();
          return addComment(taskId, comment);
        }
        if (!res.ok) throw new Error("Failed to add comment");

        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data.task : t))
        );
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      }
    },
    [fetchTasks]
  );

  const deleteComment = useCallback(
    async (
      taskId: string,
      commentId: string
    ): Promise<{ success: boolean }> => {
      try {
        const res = await fetch(
          `/api/tasks/${taskId}/comments?commentId=${commentId}`,
          { method: "DELETE" }
        );

        
        if (res.status === 409) {
          await fetchTasks();
          return deleteComment(taskId, commentId);
        }
        if (!res.ok) throw new Error("Failed to delete comment");

        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data.task : t))
        );
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
    addComment,
    deleteComment,
  };
}
