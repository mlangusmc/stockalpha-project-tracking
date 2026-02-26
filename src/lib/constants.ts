import { Status, Priority, Assignee, Repo } from "./types";

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bgColor: string }
> = {
  backlog: {
    label: "Backlog",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  todo: { label: "To Do", color: "text-blue-600", bgColor: "bg-blue-100" },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  done: { label: "Done", color: "text-green-600", bgColor: "bg-green-100" },
};

export const STATUS_ORDER: Status[] = [
  "backlog",
  "todo",
  "in-progress",
  "done",
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100" },
  medium: {
    label: "Medium",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  high: { label: "High", color: "text-red-600", bgColor: "bg-red-100" },
};

export const ASSIGNEE_CONFIG: Record<
  Assignee,
  { label: string; initials: string; color: string }
> = {
  mlang: { label: "mlang", initials: "ML", color: "bg-purple-500" },
  Dusty: { label: "Dusty", initials: "DH", color: "bg-blue-500" },
  unassigned: { label: "Unassigned", initials: "?", color: "bg-gray-400" },
};

export const REPO_CONFIG: Record<Repo, { label: string; shortLabel: string; color: string }> = {
  "stockmarkettoday-frontend": {
    label: "stockmarkettoday-frontend",
    shortLabel: "frontend",
    color: "bg-emerald-100 text-emerald-700",
  },
  "stockalpha-social-agent": {
    label: "stockalpha-social-agent",
    shortLabel: "social-agent",
    color: "bg-violet-100 text-violet-700",
  },
};

export const ASSIGNEES: Assignee[] = ["mlang", "Dusty", "unassigned"];
export const REPOS: Repo[] = [
  "stockmarkettoday-frontend",
  "stockalpha-social-agent",
];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const STATUSES: Status[] = ["backlog", "todo", "in-progress", "done"];
