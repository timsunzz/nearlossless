import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { EncodeSettings, VideoMeta } from "@/lib/types";

export type JobStatus = "ready" | "encoding" | "done" | "error";

export type Job = {
  id: string;
  createdAt: number;
  inputPath: string;
  outputPath: string;
  originalName: string;
  meta: VideoMeta;
  status: JobStatus;
  progress: number;
  error: string | null;
  settings: EncodeSettings | null;
  outputSize: number | null;
};

type Store = {
  jobs: Map<string, Job>;
};

const globalForJobs = globalThis as typeof globalThis & {
  __nearlosslessJobs?: Store;
};

function store(): Store {
  if (!globalForJobs.__nearlosslessJobs) {
    globalForJobs.__nearlosslessJobs = { jobs: new Map() };
  }
  return globalForJobs.__nearlosslessJobs;
}

export function jobDir(id: string): string {
  return join(tmpdir(), "nearlossless", id);
}

export function getJob(id: string): Job | undefined {
  return store().jobs.get(id);
}

export function listExpiredJobs(maxAgeMs = 60 * 60 * 1000): Job[] {
  const cutoff = Date.now() - maxAgeMs;
  return [...store().jobs.values()].filter((job) => job.createdAt < cutoff);
}

export async function createJob(
  id: string,
  originalName: string,
  meta: VideoMeta,
): Promise<Job> {
  const dir = jobDir(id);
  await mkdir(dir, { recursive: true });
  const job: Job = {
    id,
    createdAt: Date.now(),
    inputPath: join(dir, "input"),
    outputPath: join(dir, "output.mp4"),
    originalName,
    meta,
    status: "ready",
    progress: 0,
    error: null,
    settings: null,
    outputSize: null,
  };
  store().jobs.set(id, job);
  scheduleCleanup(id);
  return job;
}

export function updateJob(id: string, patch: Partial<Job>): Job {
  const current = store().jobs.get(id);
  if (!current) {
    throw new Error("任务不存在或已过期");
  }
  const next = { ...current, ...patch };
  store().jobs.set(id, next);
  return next;
}

export async function deleteJob(id: string): Promise<void> {
  store().jobs.delete(id);
  await rm(jobDir(id), { recursive: true, force: true });
}

function scheduleCleanup(id: string) {
  const timer = setTimeout(() => {
    void deleteJob(id);
  }, 60 * 60 * 1000);
  timer.unref();
}

export function publicJob(job: Job) {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    error: job.error,
    meta: job.meta,
    outputSize: job.outputSize,
    settings: job.settings,
  };
}
