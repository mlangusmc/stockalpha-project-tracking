"use client";

import { Task } from "@/lib/types";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  ASSIGNEE_CONFIG,
  REPO_CONFIG,
} from "@/lib/constants";

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskRow({ task, onClick }: TaskRowProps) {
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const assignee = ASSIGNEE_CONFIG[task.assignee];
  const repo = REPO_CONFIG[task.repo];

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <tr
      onClick={() => onClick(task)}
      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {task.title}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priority.bgColor} ${priority.color}`}
        >
          {priority.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white ${assignee.color}`}
          >
            {assignee.initials}
          </span>
          <span className="text-sm text-gray-600">{assignee.label}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${repo.color}`}>
          {repo.shortLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {task.dueDate ? (
          <span className={isOverdue ? "font-medium text-red-600" : ""}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}
