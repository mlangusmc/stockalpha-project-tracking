import { NextResponse } from "next/server";
import { readTasks, writeTasks, ConflictError } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";
import { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

// Force dynamic — prevent Next.js from caching this route handler
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data } = await readTasks();
    const settings: AppSettings = data.settings ?? DEFAULT_SETTINGS;
    return NextResponse.json(
      { settings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignees, repos, clients } = body as AppSettings;

    // Validate: at least one assignee
    if (!Array.isArray(assignees) || assignees.length === 0) {
      return NextResponse.json(
        { error: "At least one assignee is required" },
        { status: 400 }
      );
    }

    // Validate: at least one repo
    if (!Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "At least one repo is required" },
        { status: 400 }
      );
    }

    // Validate: "unassigned" must exist
    if (!assignees.some((a) => a.name === "unassigned")) {
      return NextResponse.json(
        { error: '"unassigned" assignee cannot be removed' },
        { status: 400 }
      );
    }

    // Validate: no duplicate assignee names
    const assigneeNames = assignees.map((a) => a.name);
    if (new Set(assigneeNames).size !== assigneeNames.length) {
      return NextResponse.json(
        { error: "Duplicate assignee names are not allowed" },
        { status: 400 }
      );
    }

    // Validate: no duplicate repo names
    const repoNames = repos.map((r) => r.name);
    if (new Set(repoNames).size !== repoNames.length) {
      return NextResponse.json(
        { error: "Duplicate repo names are not allowed" },
        { status: 400 }
      );
    }

    // Validate: clients array (may be empty, but must be an array)
    if (!Array.isArray(clients)) {
      return NextResponse.json(
        { error: "clients must be an array" },
        { status: 400 }
      );
    }

    // Validate: no duplicate client names
    if (clients.length > 0) {
      const clientNames = clients.map((c: { name: string }) => c.name);
      if (new Set(clientNames).size !== clientNames.length) {
        return NextResponse.json(
          { error: "Duplicate client names are not allowed" },
          { status: 400 }
        );
      }
    }

    const { data, etag } = await readTasks();
    data.settings = { assignees, repos, clients };

    const { etag: newEtag } = await writeTasks(data, etag);
    return NextResponse.json({ settings: data.settings, etag: newEtag });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Conflict — please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to update settings",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
