"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Task } from "@/lib/types";
import {
  PRIORITY_CONFIG,
  ASSIGNEE_CONFIG,
  REPO_CONFIG,
} from "@/lib/constants";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const assignee = ASSIGNEE_CONFIG[task.assignee];
  const repo = REPO_CONFIG[task.repo];

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-gray-800 bg-gray-800/80 p-2.5 sm:p-3 shadow-sm hover:border-gray-700 hover:shadow-md cursor-pointer touch-manipulation"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 cursor-grab text-gray-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:cursor-grabbing p-1 -m-1 touch-manipulation"
        >
          <GripVertical className="h-5 w-5 sm:h-4 sm:w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-100 truncate">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priority.bgColor} ${priority.color}`}
            >
              {priority.label}
            </span>
            <span
              className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${repo.color}`}
            >
              {repo.shortLabel}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white ${assignee.color}`}
              >
                {assignee.initials}
              </span>
              <span className="text-xs text-gray-500">{assignee.label}</span>
            </div>

            {task.dueDate && (
              <span
                className={`text-xs ${
                  isOverdue ? "font-medium text-red-400" : "text-gray-500"
                }`}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
