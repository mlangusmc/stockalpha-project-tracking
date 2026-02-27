"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Task, Status, AppSettings } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/constants";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (
    taskId: string,
    newStatus: Status,
    newOrder: number
  ) => void;
  settings: AppSettings;
}

export default function KanbanBoard({
  tasks,
  onTaskClick,
  onTaskMove,
  settings,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const tasksByStatus: Record<Status, Task[]> = {
    backlog: [],
    todo: [],
    "in-progress": [],
    done: [],
  };

  tasks.forEach((task) => {
    tasksByStatus[task.status].push(task);
  });

  function findColumnOfTask(taskId: string): Status | null {
    for (const status of STATUS_ORDER) {
      if (tasksByStatus[status].some((t) => t.id === taskId)) {
        return status;
      }
    }
    return null;
  }

  function handleDragOver(event: DragOverEvent) {
    void event;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let targetStatus: Status;

    if (STATUS_ORDER.includes(overId as Status)) {
      targetStatus = overId as Status;
    } else {
      const overColumn = findColumnOfTask(overId);
      if (!overColumn) return;
      targetStatus = overColumn;
    }

    const sourceColumn = findColumnOfTask(taskId);
    if (!sourceColumn) return;

    const targetTasks = tasksByStatus[targetStatus]
      .filter((t) => t.id !== taskId)
      .sort((a, b) => a.order - b.order);

    let newOrder: number;
    if (overId === targetStatus as string) {
      newOrder = targetTasks.length;
    } else {
      const overIndex = targetTasks.findIndex((t) => t.id === overId);
      newOrder = overIndex >= 0 ? overIndex : targetTasks.length;
    }

    if (sourceColumn === targetStatus) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.order === newOrder) return;
    }

    onTaskMove(taskId, targetStatus, newOrder);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto p-3 sm:gap-4 sm:p-4" style={{ minHeight: "calc(100vh - 56px)" }}>
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
            settings={settings}
          />
        ))}
      </div>
    </DndContext>
  );
}
