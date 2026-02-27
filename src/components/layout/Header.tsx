"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus, Filter, ChevronDown } from "lucide-react";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    (filters.assignee && filters.assignee !== "all") ||
    (filters.repo && filters.repo !== "all") ||
    (filters.priority && filters.priority !== "all");

  return (
    <header className="border-b border-gray-800 bg-gray-900 px-3 py-2.5 sm:px-6 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-gray-50 sm:text-xl whitespace-nowrap">
          StockAlpha Tracker
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Filter toggle (mobile) / inline filters (desktop) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-sm sm:hidden ${
              hasActiveFilters
                ? "border-blue-600 text-blue-400"
                : "border-gray-700 text-gray-400"
            }`}
          >
            <Filter className="h-4 w-4" />
            <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Desktop filters */}
          <div className="hidden sm:flex items-center gap-1.5">
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
              className={`flex items-center gap-1 px-2.5 py-1 text-sm ${
                view === "kanban"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              } rounded-l-md`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline">Board</span>
            </button>
            <button
              onClick={() => onViewChange("list")}
              className={`flex items-center gap-1 px-2.5 py-1 text-sm ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              } rounded-r-md`}
            >
              <List className="h-4 w-4" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>

          {/* New task button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="mt-2.5 flex flex-col gap-2 border-t border-gray-800 pt-2.5 sm:hidden">
          <select
            value={filters.assignee || "all"}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                assignee: e.target.value as Assignee | "all",
              })
            }
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
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
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
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
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
}
