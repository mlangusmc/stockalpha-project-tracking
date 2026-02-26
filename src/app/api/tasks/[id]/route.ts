import { NextResponse } from "next/server";
import { readTasks, writeTasks, ConflictError } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data } = await readTasks();
    const task = data.tasks.find((t) => t.id === id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Failed to read task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { data, etag } = await readTasks();

    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = {
      ...data.tasks[index],
      ...body,
      id, // prevent id overwrite
      updatedAt: new Date().toISOString(),
    };

    data.tasks[index] = updated;

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ task: updated, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update task", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data, etag } = await readTasks();

    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    data.tasks.splice(index, 1);

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ success: true, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete task", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
