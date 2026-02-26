export type Status = "backlog" | "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";
export type Assignee = "mlang" | "Dusty" | "unassigned";
export type Repo = "stockmarkettoday-frontend" | "stockalpha-social-agent";

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
}

export interface TaskStore {
  tasks: Task[];
}

export interface TaskFilters {
  assignee?: Assignee | "all";
  repo?: Repo | "all";
  priority?: Priority | "all";
}
