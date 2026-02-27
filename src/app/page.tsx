"use client";

import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import PinDialog from "@/components/layout/PinDialog";
import TaskDialog from "@/components/task/TaskDialog";
import KanbanBoard from "@/components/board/KanbanBoard";
import TaskList from "@/components/list/TaskList";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { Task, TaskFilters, Status } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useTasks(filters);
  const {
    showPinDialog,
    handleAuthRequired,
    handlePinSuccess,
    handlePinCancel,
  } = useAuth();

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: Partial<Task>) => {
      let result;
      if (editingTask) {
        result = await updateTask(editingTask.id, data);
      } else {
        result = await createTask(data);
      }

      if (result.needsAuth) {
        handleAuthRequired(() => {
          if (editingTask) {
            updateTask(editingTask.id, data);
          } else {
            createTask(data);
          }
          setTaskDialogOpen(false);
          setEditingTask(null);
        });
        return;
      }

      if (result.success) {
        setTaskDialogOpen(false);
        setEditingTask(null);
      }
    },
    [editingTask, createTask, updateTask, handleAuthRequired]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteTask(id);

      if (result.needsAuth) {
        handleAuthRequired(() => {
          deleteTask(id);
          setTaskDialogOpen(false);
          setEditingTask(null);
        });
        return;
      }

      if (result.success) {
        setTaskDialogOpen(false);
        setEditingTask(null);
      }
    },
    [deleteTask, handleAuthRequired]
  );

  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: Status, newOrder: number) => {
      const result = await updateTask(taskId, {
        status: newStatus,
        order: newOrder,
      });

      if (result.needsAuth) {
        handleAuthRequired(() => {
          updateTask(taskId, { status: newStatus, order: newOrder });
        });
      }
    },
    [updateTask, handleAuthRequired]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        onNewTask={handleNewTask}
      />

      <main className="flex-1">
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
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
          />
        ) : (
          <div className="p-4">
            <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
          </div>
        )}
      </main>

      <TaskDialog
        open={taskDialogOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
      />

      <PinDialog
        open={showPinDialog}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    </div>
  );
}
