import { Status, Priority, Assignee, Repo } from "./types";

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bgColor: string }
> = {
  backlog: {
    label: "Backlog",
    color: "text-gray-400",
    bgColor: "bg-gray-800",
  },
  todo: { label: "To Do", color: "text-blue-400", bgColor: "bg-blue-900/50" },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-400",
    bgColor: "bg-amber-900/50",
  },
  done: { label: "Done", color: "text-green-400", bgColor: "bg-green-900/50" },
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
  low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-800" },
  medium: {
    label: "Medium",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/50",
  },
  high: { label: "High", color: "text-red-400", bgColor: "bg-red-900/50" },
};

export const ASSIGNEE_CONFIG: Record<
  Assignee,
  { label: string; initials: string; color: string }
> = {
  mlang: { label: "mlang", initials: "ML", color: "bg-purple-600" },
  Dusty: { label: "Dusty", initials: "DH", color: "bg-blue-600" },
  unassigned: { label: "Unassigned", initials: "?", color: "bg-gray-600" },
};

export const REPO_CONFIG: Record<Repo, { label: string; shortLabel: string; color: string }> = {
  "stockmarkettoday-frontend": {
    label: "stockmarkettoday-frontend",
    shortLabel: "frontend",
    color: "bg-emerald-900/50 text-emerald-400",
  },
  "stockalpha-social-agent": {
    label: "stockalpha-social-agent",
    shortLabel: "social-agent",
    color: "bg-violet-900/50 text-violet-400",
  },
};

export const ASSIGNEES: Assignee[] = ["mlang", "Dusty", "unassigned"];
export const REPOS: Repo[] = [
  "stockmarkettoday-frontend",
  "stockalpha-social-agent",
];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const STATUSES: Status[] = ["backlog", "todo", "in-progress", "done"];
