import { NextResponse } from "next/server";
import { readTasks, writeTasks, ConflictError } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";
import { Comment } from "@/lib/types";

export async function POST(
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
    const { author, content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const { data, etag } = await readTasks();
    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      author: author || "mlang",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const task = data.tasks[index];
    task.comments = [...(task.comments ?? []), comment];
    task.updatedAt = new Date().toISOString();

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ task, comment, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to add comment",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId query param is required" },
        { status: 400 }
      );
    }

    const { data, etag } = await readTasks();
    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = data.tasks[index];
    const comments = task.comments ?? [];
    const commentIndex = comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    comments.splice(commentIndex, 1);
    task.comments = comments;
    task.updatedAt = new Date().toISOString();

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ task, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to delete comment",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
