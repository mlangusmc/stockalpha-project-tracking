"use client";

import { Task, AppSettings } from "@/lib/types";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  getAssigneeConfig,
  getRepoConfig,
} from "@/lib/constants";

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
  settings: AppSettings;
}

export default function TaskRow({ task, onClick, settings }: TaskRowProps) {
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const assignee = getAssigneeConfig(task.assignee, settings.assignees);
  const repo = getRepoConfig(task.repo, settings.repos);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <tr
      onClick={() => onClick(task)}
      className="cursor-pointer border-b border-gray-800/50 hover:bg-gray-800/50"
    >
      <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-100">
        {task.title}
      </td>
      <td className="px-3 sm:px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priority.bgColor} ${priority.color}`}
        >
          {priority.label}
        </span>
      </td>
      <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white ${assignee.color}`}
          >
            {assignee.initials}
          </span>
          <span className="text-sm text-gray-400">{assignee.label}</span>
        </div>
      </td>
      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${repo.color}`}>
          {repo.shortLabel}
        </span>
      </td>
      <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
        {task.dueDate ? (
          <span className={isOverdue ? "font-medium text-red-400" : ""}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}
