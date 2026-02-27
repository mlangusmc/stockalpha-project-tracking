"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Task, Status, Priority, Assignee, Repo } from "@/lib/types";
import {
  STATUSES,
  PRIORITIES,
  ASSIGNEES,
  REPOS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  ASSIGNEE_CONFIG,
  REPO_CONFIG,
} from "@/lib/constants";

interface TaskDialogProps {
  open: boolean;
  task?: Task | null;
  onSave: (data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export default function TaskDialog({
  open,
  task,
  onSave,
  onDelete,
  onClose,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("backlog");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<Assignee>("unassigned");
  const [repo, setRepo] = useState<Repo>("stockmarkettoday-frontend");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(task.assignee);
      setRepo(task.repo);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("backlog");
      setPriority("medium");
      setAssignee("unassigned");
      setRepo("stockmarkettoday-frontend");
      setDueDate("");
    }
  }, [task, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      status,
      priority,
      assignee,
      repo,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  const isEdit = !!task;

  const inputClasses =
    "w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg bg-gray-900 border border-gray-700 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-50">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={inputClasses}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={inputClasses}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as Assignee)}
                className={inputClasses}
              >
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {ASSIGNEE_CONFIG[a].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Repo
              </label>
              <select
                value={repo}
                onChange={(e) => setRepo(e.target.value as Repo)}
                className={inputClasses}
              >
                {REPOS.map((r) => (
                  <option key={r} value={r}>
                    {REPO_CONFIG[r].shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task!.id)}
                className="rounded-md border border-red-800 px-3 py-2.5 sm:py-2 text-sm font-medium text-red-400 hover:bg-red-900/30"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-700 px-4 py-2.5 sm:py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-md bg-blue-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
