import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { buildEncodeArgs } from "@/lib/encode-args";
import { updateJob, type Job } from "@/lib/jobs";
import type { EncodeSettings } from "@/lib/types";

function parseProgress(chunk: string, duration: number): number | null {
  const match = chunk.match(/out_time_ms=(\d+)/);
  if (!match || duration <= 0) return null;
  const seconds = Number(match[1]) / 1_000_000;
  return Math.min(0.99, Math.max(0, seconds / duration));
}

export function encodeJob(
  job: Job,
  settings: EncodeSettings,
  onProgress: (progress: number) => void,
): Promise<{ outputSize: number }> {
  const args = [
    "-hide_banner",
    "-y",
    "-progress",
    "pipe:1",
    "-nostats",
    ...buildEncodeArgs({
      input: job.inputPath,
      output: job.outputPath,
      settings,
      hasAudio: job.meta.hasAudio,
      audioCodec: job.meta.audioCodec,
    }).slice(2),
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    let stdout = "";

    proc.stdout.on("data", (buf: Buffer) => {
      stdout += buf.toString("utf8");
      const progress = parseProgress(stdout, job.meta.duration);
      if (progress != null) {
        updateJob(job.id, { progress });
        onProgress(progress);
        if (stdout.length > 4000) {
          stdout = stdout.slice(-1000);
        }
      }
    });

    proc.stderr.on("data", (buf: Buffer) => {
      stderr += buf.toString("utf8");
      if (stderr.length > 20_000) {
        stderr = stderr.slice(-8000);
      }
    });

    proc.on("error", (error) => {
      reject(error);
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(lastFfmpegError(stderr) || `编码失败（退出码 ${code}）`));
        return;
      }
      try {
        const info = await stat(job.outputPath);
        updateJob(job.id, { progress: 1, status: "done", outputSize: info.size });
        onProgress(1);
        resolve({ outputSize: info.size });
      } catch {
        reject(new Error("编码完成，但找不到输出文件"));
      }
    });
  });
}

function lastFfmpegError(stderr: string): string {
  const lines = stderr
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(-3).join(" ").slice(0, 280);
}
