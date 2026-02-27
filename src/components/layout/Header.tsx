"use client";

import { LayoutGrid, List, Plus, Filter } from "lucide-react";
import { Assignee, Repo, Priority, TaskFilters } from "@/lib/types";
import { ASSIGNEES, REPOS, PRIORITIES, ASSIGNEE_CONFIG, REPO_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";

interface HeaderProps {
  view: "kanban" | "list";
  onViewChange: (view: "kanban" | "list") => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onNewTask: () => void;
}

export default function Header({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  onNewTask,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-50">
            StockAlpha Tracker
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-gray-500" />

            <select
              value={filters.assignee || "all"}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  assignee: e.target.value as Assignee | "all",
                })
              }
              className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-300"
            >
              <option value="all">All Assignees</option>
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {ASSIGNEE_CONFIG[a].label}
                </option>
              ))}
            </select>

            <select
              value={filters.repo || "all"}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  repo: e.target.value as Repo | "all",
                })
              }
              className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-300"
            >
              <option value="all">All Repos</option>
              {REPOS.map((r) => (
                <option key={r} value={r}>
                  {REPO_CONFIG[r].shortLabel}
                </option>
              ))}
            </select>

            <select
              value={filters.priority || "all"}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priority: e.target.value as Priority | "all",
                })
              }
              className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-300"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex rounded-md border border-gray-700">
            <button
              onClick={() => onViewChange("kanban")}
              className={`flex items-center gap-1 px-3 py-1 text-sm ${
                view === "kanban"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              } rounded-l-md`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => onViewChange("list")}
              className={`flex items-center gap-1 px-3 py-1 text-sm ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              } rounded-r-md`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* New task button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>
    </header>
  );
}
