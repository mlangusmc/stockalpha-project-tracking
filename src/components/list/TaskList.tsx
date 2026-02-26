"use client";

import { Task } from "@/lib/types";
import TaskRow from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const sorted = [...tasks].sort((a, b) => {
    const statusOrder = ["backlog", "todo", "in-progress", "done"];
    const statusDiff =
      statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    return a.order - b.order;
  });

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Create a task to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Title
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Priority
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Assignee
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Repo
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <TaskRow key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
