import { TaskStore } from "./types";

const IS_VERCEL = process.env.VERCEL === "1";
const BLOB_KEY = "tasks.json";

// In-memory ETag for local dev
let localEtag = Date.now().toString();

function getLocalEtag(): string {
  return localEtag;
}

function bumpLocalEtag(): string {
  localEtag = Date.now().toString();
  return localEtag;
}

export async function readTasks(): Promise<{ data: TaskStore; etag: string }> {
  if (IS_VERCEL) {
    return readFromBlob();
  }
  return readFromFile();
}

export async function writeTasks(
  data: TaskStore,
  expectedEtag: string
): Promise<{ etag: string }> {
  if (IS_VERCEL) {
    return writeToBlob(data, expectedEtag);
  }
  return writeToFile(data, expectedEtag);
}

// --- Local file implementation ---

async function readFromFile(): Promise<{ data: TaskStore; etag: string }> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "tasks.json");

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content) as TaskStore;
    return { data, etag: getLocalEtag() };
  } catch {
    const empty: TaskStore = { tasks: [] };
    return { data: empty, etag: getLocalEtag() };
  }
}

async function writeToFile(
  data: TaskStore,
  expectedEtag: string
): Promise<{ etag: string }> {
  const currentEtag = getLocalEtag();
  if (expectedEtag && expectedEtag !== currentEtag) {
    throw new ConflictError("ETag mismatch — data was modified by another request");
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "tasks.json");

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  const newEtag = bumpLocalEtag();
  return { etag: newEtag };
}

// --- Vercel Blob implementation ---

async function readFromBlob(): Promise<{ data: TaskStore; etag: string }> {
  const { list } = await import("@vercel/blob");

  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  if (blobs.length === 0) {
    const empty: TaskStore = { tasks: [] };
    return { data: empty, etag: "" };
  }

  const blob = blobs[0];
  const response = await fetch(blob.downloadUrl);
  const data = (await response.json()) as TaskStore;
  const etag = blob.uploadedAt.toISOString();

  return { data, etag };
}

async function writeToBlob(
  data: TaskStore,
  expectedEtag: string
): Promise<{ etag: string }> {
  const { put, head } = await import("@vercel/blob");

  // Optimistic concurrency check
  if (expectedEtag) {
    try {
      const existing = await head(BLOB_KEY);
      const currentEtag = existing.uploadedAt.toISOString();
      if (currentEtag !== expectedEtag) {
        throw new ConflictError("ETag mismatch — data was modified by another request");
      }
    } catch (err) {
      if (err instanceof ConflictError) throw err;
      // Blob doesn't exist yet, no conflict
    }
  }

  const blob = await put(BLOB_KEY, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  return { etag: blob.etag };
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
