"use client";

import { useState, useCallback, useMemo } from "react";
import Header from "@/components/layout/Header";
import TaskDialog from "@/components/task/TaskDialog";
import KanbanBoard from "@/components/board/KanbanBoard";
import TaskList from "@/components/list/TaskList";
import SettingsDialog from "@/components/settings/SettingsDialog";
import { useTasks } from "@/hooks/useTasks";
import { useSettings } from "@/hooks/useSettings";
import { Task, TaskFilters, Status, AppSettings } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [search, setSearch] = useState("");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Pause polling while any dialog is open to prevent overwriting user edits
  const anyDialogOpen = taskDialogOpen || settingsOpen;

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    deleteComment,
  } = useTasks(filters, anyDialogOpen);

  const { settings, updateSettings } = useSettings(anyDialogOpen);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const editingTask = useMemo(
    () => (editingTaskId ? tasks.find((t) => t.id === editingTaskId) ?? null : null),
    [editingTaskId, tasks]
  );

  const handleNewTask = useCallback(() => {
    setEditingTaskId(null);
    setTaskDialogOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setTaskDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: Partial<Task>) => {
      const result = editingTask
        ? await updateTask(editingTask.id, data)
        : await createTask(data);

      if (result.success) {
        setTaskDialogOpen(false);
        setEditingTaskId(null);
      }
    },
    [editingTask, createTask, updateTask]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteTask(id);
      if (result.success) {
        setTaskDialogOpen(false);
        setEditingTaskId(null);
      }
    },
    [deleteTask]
  );

  const handleAddComment = useCallback(
    async (taskId: string, comment: { author: string; content: string }) => {
      await addComment(taskId, comment);
    },
    [addComment]
  );

  const handleDeleteComment = useCallback(
    async (taskId: string, commentId: string) => {
      await deleteComment(taskId, commentId);
    },
    [deleteComment]
  );

  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: Status, newOrder: number) => {
      await updateTask(taskId, { status: newStatus, order: newOrder });
    },
    [updateTask]
  );

  const handleSettingsSave = useCallback(
    async (newSettings: AppSettings) => {
      const result = await updateSettings(newSettings);
      if (result.success) {
        setSettingsOpen(false);
      }
    },
    [updateSettings]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        search={search}
        onSearchChange={setSearch}
        onNewTask={handleNewTask}
        settings={settings}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <p className="text-lg font-medium">Error loading tasks</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : view === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            settings={settings}
          />
        ) : (
          <div className="p-4">
            <TaskList tasks={filteredTasks} onTaskClick={handleTaskClick} settings={settings} />
          </div>
        )}
      </main>

      <TaskDialog
        open={taskDialogOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTaskId(null);
        }}
        settings={settings}
      />

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onSave={handleSettingsSave}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
