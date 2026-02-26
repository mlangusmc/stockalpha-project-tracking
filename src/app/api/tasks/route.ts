import { NextRequest, NextResponse } from "next/server";
import { readTasks, writeTasks, ConflictError } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";
import { Task, Status, Priority, Assignee, Repo } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { data, etag } = await readTasks();
    let tasks = data.tasks;

    const url = request.nextUrl;
    const assignee = url.searchParams.get("assignee");
    const repo = url.searchParams.get("repo");
    const priority = url.searchParams.get("priority");
    const status = url.searchParams.get("status");

    if (assignee && assignee !== "all") {
      tasks = tasks.filter((t) => t.assignee === assignee);
    }
    if (repo && repo !== "all") {
      tasks = tasks.filter((t) => t.repo === repo);
    }
    if (priority && priority !== "all") {
      tasks = tasks.filter((t) => t.priority === priority);
    }
    if (status && status !== "all") {
      tasks = tasks.filter((t) => t.status === status);
    }

    return NextResponse.json({ tasks, etag });
  } catch {
    return NextResponse.json(
      { error: "Failed to read tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data, etag } = await readTasks();

    const maxId = data.tasks.reduce(
      (max, t) => Math.max(max, parseInt(t.id, 10) || 0),
      0
    );

    const sameStatusTasks = data.tasks.filter(
      (t) => t.status === (body.status || "backlog")
    );
    const maxOrder = sameStatusTasks.reduce(
      (max, t) => Math.max(max, t.order),
      -1
    );

    const now = new Date().toISOString();
    const newTask: Task = {
      id: String(maxId + 1),
      title: body.title || "Untitled",
      description: body.description || "",
      status: (body.status as Status) || "backlog",
      assignee: (body.assignee as Assignee) || "unassigned",
      repo: (body.repo as Repo) || "stockmarkettoday-frontend",
      priority: (body.priority as Priority) || "medium",
      createdAt: now,
      updatedAt: now,
      dueDate: body.dueDate || null,
      order: maxOrder + 1,
    };

    data.tasks.push(newTask);

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ task: newTask, etag: newEtag }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
