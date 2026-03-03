"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Task, TaskFilters } from "@/lib/types";

export function useTasks(filters?: TaskFilters, paused = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const etagRef = useRef<string>("");

  // Tracks in-flight mutations so polls can be skipped / discarded
  const pendingMutationsRef = useRef(0);

  // Core fetch — used by mutations (409 retry) without mutation guard.
  // Accepts an optional `guardMutations` flag for poll-initiated fetches so
  // that stale data arriving after a mutation started is safely discarded.
  const fetchTasks = useCallback(
    async (options?: { guardMutations?: boolean }) => {
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

        // If a mutation started while this fetch was in-flight, discard
        if (options?.guardMutations && pendingMutationsRef.current > 0) return;

        setTasks(data.tasks);
        etagRef.current = data.etag;
        setError(null);
      } catch (err) {
        if (options?.guardMutations && pendingMutationsRef.current > 0) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [filters?.assignee, filters?.repo, filters?.priority, filters?.client]
  );

  // Polling effect — pauses when a dialog is open and skips cycles
  // while mutations are in-flight to protect optimistic updates.
  useEffect(() => {
    if (paused) return;

    let cancelled = false;

    function safePoll() {
      if (cancelled || pendingMutationsRef.current > 0) return;
      fetchTasks({ guardMutations: true });
    }

    // Immediate fetch when polling (re)starts (e.g. dialog just closed)
    safePoll();
    const interval = setInterval(safePoll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchTasks, paused]);

  const createTask = useCallback(
    async (
      task: Partial<Task>
    ): Promise<{ success: boolean }> => {
      pendingMutationsRef.current++;
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });

        if (res.status === 409) {
          await fetchTasks();
          pendingMutationsRef.current--;
          return createTask(task);
        }
        if (!res.ok) throw new Error("Failed to create task");

        const data = await res.json();
        setTasks((prev) => [...prev, data.task]);
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      } finally {
        pendingMutationsRef.current--;
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (
      id: string,
      updates: Partial<Task>
    ): Promise<{ success: boolean }> => {
      pendingMutationsRef.current++;

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
          pendingMutationsRef.current--;
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
      } finally {
        pendingMutationsRef.current--;
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (
      id: string
    ): Promise<{ success: boolean }> => {
      pendingMutationsRef.current++;

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
          pendingMutationsRef.current--;
          return deleteTask(id);
        }
        if (!res.ok) throw new Error("Failed to delete task");

        return { success: true };
      } catch (err) {
        // Rollback on failure
        if (snapshot.length) setTasks(snapshot);
        setError(err instanceof Error ? err.message : "Unknown error");
        return { success: false };
      } finally {
        pendingMutationsRef.current--;
      }
    },
    [fetchTasks]
  );

  const addComment = useCallback(
    async (
      taskId: string,
      comment: { author: string; content: string }
    ): Promise<{ success: boolean }> => {
      pendingMutationsRef.current++;
      try {
        const res = await fetch(`/api/tasks/${taskId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment),
        });

        if (res.status === 409) {
          await fetchTasks();
          pendingMutationsRef.current--;
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
      } finally {
        pendingMutationsRef.current--;
      }
    },
    [fetchTasks]
  );

  const deleteComment = useCallback(
    async (
      taskId: string,
      commentId: string
    ): Promise<{ success: boolean }> => {
      pendingMutationsRef.current++;
      try {
        const res = await fetch(
          `/api/tasks/${taskId}/comments?commentId=${commentId}`,
          { method: "DELETE" }
        );

        if (res.status === 409) {
          await fetchTasks();
          pendingMutationsRef.current--;
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
      } finally {
        pendingMutationsRef.current--;
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
