import { Status, Priority, AppSettings, AssigneeConfig, RepoConfig, ClientConfig } from "./types";

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bgColor: string }
> = {
  backlog: {
    label: "Backlog",
    color: "text-gray-400",
    bgColor: "bg-gray-800",
  },
  "pre-todo": {
    label: "Pre-Contract To Do",
    color: "text-purple-400",
    bgColor: "bg-purple-900/50",
  },
  "pre-in-progress": {
    label: "Pre-Contract In Progress",
    color: "text-indigo-400",
    bgColor: "bg-indigo-900/50",
  },
  "pre-complete": {
    label: "Pre-Contract Complete",
    color: "text-violet-400",
    bgColor: "bg-violet-900/50",
  },
  "dev-todo": {
    label: "Dev To Do",
    color: "text-blue-400",
    bgColor: "bg-blue-900/50",
  },
  "dev-in-progress": {
    label: "Dev In Progress",
    color: "text-amber-400",
    bgColor: "bg-amber-900/50",
  },
  "dev-issue": {
    label: "Dev Issue",
    color: "text-red-400",
    bgColor: "bg-red-900/50",
  },
  "dev-complete": {
    label: "Dev Complete",
    color: "text-green-400",
    bgColor: "bg-green-900/50",
  },
};

export const STATUS_ORDER: Status[] = [
  "backlog",
  "pre-todo",
  "pre-in-progress",
  "pre-complete",
  "dev-todo",
  "dev-in-progress",
  "dev-issue",
  "dev-complete",
];

export const STATUSES: Status[] = [
  "backlog",
  "pre-todo",
  "pre-in-progress",
  "pre-complete",
  "dev-todo",
  "dev-in-progress",
  "dev-issue",
  "dev-complete",
];

export const STATUS_GROUPS: { label: string; statuses: Status[] }[] = [
  { label: "Backlog", statuses: ["backlog"] },
  { label: "Pre-Contract", statuses: ["pre-todo", "pre-in-progress", "pre-complete"] },
  { label: "Development", statuses: ["dev-todo", "dev-in-progress", "dev-issue", "dev-complete"] },
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

export const PRIORITIES: Priority[] = ["low", "medium", "high"];

// --- Color palettes for dynamic assignees/repos/clients ---

export const ASSIGNEE_COLORS: string[] = [
  "bg-purple-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-orange-600",
  "bg-lime-600",
  "bg-fuchsia-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-red-600",
];

export const REPO_COLORS: string[] = [
  "bg-emerald-900/50 text-emerald-400",
  "bg-violet-900/50 text-violet-400",
  "bg-blue-900/50 text-blue-400",
  "bg-rose-900/50 text-rose-400",
  "bg-amber-900/50 text-amber-400",
  "bg-cyan-900/50 text-cyan-400",
  "bg-pink-900/50 text-pink-400",
  "bg-indigo-900/50 text-indigo-400",
  "bg-teal-900/50 text-teal-400",
  "bg-orange-900/50 text-orange-400",
];

export const CLIENT_COLORS: string[] = [
  "bg-sky-900/50 text-sky-400",
  "bg-lime-900/50 text-lime-400",
  "bg-rose-900/50 text-rose-400",
  "bg-amber-900/50 text-amber-400",
  "bg-cyan-900/50 text-cyan-400",
  "bg-fuchsia-900/50 text-fuchsia-400",
  "bg-teal-900/50 text-teal-400",
  "bg-orange-900/50 text-orange-400",
  "bg-indigo-900/50 text-indigo-400",
  "bg-emerald-900/50 text-emerald-400",
];

// --- Default settings (matches old hardcoded values) ---

export const DEFAULT_SETTINGS: AppSettings = {
  assignees: [
    { name: "mlang", label: "mlang", initials: "ML", color: "bg-purple-600" },
    { name: "Dusty", label: "Dusty", initials: "DH", color: "bg-blue-600" },
    { name: "unassigned", label: "Unassigned", initials: "?", color: "bg-gray-600" },
    { name: "sheldon", label: "Sheldon", initials: "SH", color: "bg-orange-600" },
    { name: "dev-agent", label: "Dev Agent", initials: "DA", color: "bg-green-600" },
    { name: "test-agent", label: "Test Agent", initials: "TA", color: "bg-red-600" },
    { name: "optimizer-agent", label: "Optimizer", initials: "OA", color: "bg-yellow-600" },
    { name: "deploy-agent", label: "Deploy Agent", initials: "DE", color: "bg-cyan-600" },
  ],
  repos: [
    {
      name: "stockmarkettoday-frontend",
      label: "stockmarkettoday-frontend",
      shortLabel: "frontend",
      color: "bg-emerald-900/50 text-emerald-400",
    },
    {
      name: "stockalpha-social-agent",
      label: "stockalpha-social-agent",
      shortLabel: "social-agent",
      color: "bg-violet-900/50 text-violet-400",
    },
    {
      name: "sheldon-ai",
      label: "sheldon-ai",
      shortLabel: "sheldon",
      color: "bg-orange-900/50 text-orange-400",
    },
  ],
  clients: [],
};

// --- Lookup helpers with graceful fallbacks ---

const FALLBACK_ASSIGNEE: AssigneeConfig = {
  name: "",
  label: "",
  initials: "?",
  color: "bg-gray-600",
};

const FALLBACK_REPO: RepoConfig = {
  name: "",
  label: "",
  shortLabel: "",
  color: "bg-gray-800 text-gray-400",
};

const FALLBACK_CLIENT: ClientConfig = {
  name: "",
  label: "",
  color: "bg-gray-800 text-gray-400",
};

export function getAssigneeConfig(
  name: string,
  assignees: AssigneeConfig[]
): AssigneeConfig {
  const found = assignees.find((a) => a.name === name);
  if (found) return found;
  return { ...FALLBACK_ASSIGNEE, name, label: name, initials: name.slice(0, 2).toUpperCase() };
}

export function getRepoConfig(
  name: string,
  repos: RepoConfig[]
): RepoConfig {
  const found = repos.find((r) => r.name === name);
  if (found) return found;
  return { ...FALLBACK_REPO, name, label: name, shortLabel: name };
}

export function getClientConfig(
  name: string,
  clients: ClientConfig[]
): ClientConfig {
  const found = clients.find((c) => c.name === name);
  if (found) return found;
  return { ...FALLBACK_CLIENT, name, label: name };
}
