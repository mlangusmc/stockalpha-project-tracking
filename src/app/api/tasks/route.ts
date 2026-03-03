import { NextRequest, NextResponse } from "next/server";
import { readTasks, writeTasks, ConflictError } from "@/lib/store";
import { Task, Status, Priority } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

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
    const client = url.searchParams.get("client");
    if (client && client !== "all") {
      tasks = tasks.filter((t) => t.client === client);
    }

    return NextResponse.json(
      { tasks, etag },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to read tasks" },
      { status: 500 }
    );
  }
}

// Batch update: PATCH /api/tasks  body: { updates: [{ id, ...fields }] }
export async function PATCH(request: Request) {
  try {
    const { updates } = await request.json();
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates must be a non-empty array" },
        { status: 400 }
      );
    }

    const { data, etag } = await readTasks();
    const now = new Date().toISOString();

    for (const update of updates) {
      const { id, ...fields } = update;
      const index = data.tasks.findIndex((t) => t.id === id);
      if (index === -1) continue;
      data.tasks[index] = { ...data.tasks[index], ...fields, id, updatedAt: now };
    }

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ tasks: data.tasks, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to batch update", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const settings = data.settings ?? DEFAULT_SETTINGS;
    const defaultRepo = settings.repos[0]?.name ?? "stockmarkettoday-frontend";

    const now = new Date().toISOString();
    const newTask: Task = {
      id: String(maxId + 1),
      title: body.title || "Untitled",
      description: body.description || "",
      status: (body.status as Status) || "backlog",
      assignee: body.assignee || "unassigned",
      repo: body.repo || defaultRepo,
      client: body.client || "",
      priority: (body.priority as Priority) || "medium",
      createdAt: now,
      updatedAt: now,
      dueDate: body.dueDate || null,
      order: maxOrder + 1,
      comments: [],
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
      { error: "Failed to create task", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
