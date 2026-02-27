export type Status = "backlog" | "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";
export type Assignee = string;
export type Repo = string;

export interface AssigneeConfig {
  name: string;
  label: string;
  initials: string;
  color: string;
}

export interface RepoConfig {
  name: string;
  label: string;
  shortLabel: string;
  color: string;
}

export interface AppSettings {
  assignees: AssigneeConfig[];
  repos: RepoConfig[];
}

export interface Comment {
  id: string;
  author: Assignee;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  assignee: Assignee;
  repo: Repo;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  order: number;
  comments: Comment[];
}

export interface TaskStore {
  tasks: Task[];
  settings?: AppSettings;
}

export interface TaskFilters {
  assignee?: Assignee | "all";
  repo?: Repo | "all";
  priority?: Priority | "all";
}
