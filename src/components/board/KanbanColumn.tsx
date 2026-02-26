"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, Status } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];
  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`flex h-full min-w-[280px] flex-col rounded-lg bg-gray-50 ${
        isOver ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${config.bgColor}`}
        />
        <h3 className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </h3>
        <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
        style={{ minHeight: 80 }}
      >
        <SortableContext
          items={sorted.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
