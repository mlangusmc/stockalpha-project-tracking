"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Task, AppSettings } from "@/lib/types";
import TaskRow from "./TaskRow";

type SortField = "title" | "status" | "priority" | "assignee" | "repo" | "client" | "dueDate";
type SortDirection = "asc" | "desc";

const STATUS_ORDER = [
  "backlog", "pre-todo", "pre-in-progress", "pre-complete",
  "dev-todo", "dev-in-progress", "dev-issue", "dev-complete",
];
const PRIORITY_ORDER = ["low", "medium", "high"];

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  settings: AppSettings;
}

function compareTasks(a: Task, b: Task, field: SortField, dir: SortDirection): number {
  let cmp = 0;

  switch (field) {
    case "title":
      cmp = a.title.localeCompare(b.title);
      break;
    case "status":
      cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      break;
    case "priority":
      cmp = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      break;
    case "assignee":
      cmp = a.assignee.localeCompare(b.assignee);
      break;
    case "repo":
      cmp = a.repo.localeCompare(b.repo);
      break;
    case "client":
      cmp = (a.client || "").localeCompare(b.client || "");
      break;
    case "dueDate": {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      cmp = aDate - bDate;
      break;
    }
  }

  return dir === "desc" ? -cmp : cmp;
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortHeader({ label, field, currentField, currentDir, onSort, className = "" }: SortHeaderProps) {
  const isActive = currentField === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`px-3 sm:px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-300 ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5 text-blue-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-blue-400" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </th>
  );
}

export default function TaskList({ tasks, onTaskClick, settings }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    const cmp = compareTasks(a, b, sortField, sortDir);
    if (cmp !== 0) return cmp;
    return a.order - b.order;
  });

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Create a task to get started</p>
      </div>
    );
  }

  const headerProps = { currentField: sortField, currentDir: sortDir, onSort: handleSort };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full">
        <thead>
          <tr className="group border-b border-gray-800 bg-gray-900 text-left">
            <SortHeader label="Title" field="title" {...headerProps} />
            <SortHeader label="Status" field="status" {...headerProps} />
            <SortHeader label="Priority" field="priority" {...headerProps} className="hidden sm:table-cell" />
            <SortHeader label="Assignee" field="assignee" {...headerProps} className="hidden md:table-cell" />
            <SortHeader label="Repo" field="repo" {...headerProps} className="hidden lg:table-cell" />
            <SortHeader label="Client" field="client" {...headerProps} className="hidden lg:table-cell" />
            <SortHeader label="Due Date" field="dueDate" {...headerProps} className="hidden sm:table-cell" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <TaskRow key={task.id} task={task} onClick={onTaskClick} settings={settings} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
