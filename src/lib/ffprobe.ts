import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { VideoMeta } from "@/lib/types";

const execFileAsync = promisify(execFile);

type FfprobeStream = {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  bit_rate?: string;
  duration?: string;
};

type FfprobeJson = {
  format?: {
    filename?: string;
    size?: string;
    duration?: string;
    bit_rate?: string;
  };
  streams?: FfprobeStream[];
};

function parseRate(value?: string): number | null {
  if (!value || value === "0/0") return null;
  const [num, den] = value.split("/").map(Number);
  if (!den) return Number.isFinite(num) ? num : null;
  const fps = num / den;
  return Number.isFinite(fps) ? fps : null;
}

export async function probeVideo(
  filePath: string,
  filename: string,
  fallbackSize: number,
): Promise<VideoMeta> {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ],
    { maxBuffer: 8 * 1024 * 1024 },
  );

  const data = JSON.parse(stdout) as FfprobeJson;
  const video = data.streams?.find((stream) => stream.codec_type === "video");
  const audio = data.streams?.find((stream) => stream.codec_type === "audio");

  if (!video) {
    throw new Error("没有找到视频轨道");
  }

  const duration = Number(data.format?.duration ?? video.duration ?? 0);
  const size = Number(data.format?.size ?? fallbackSize);
  const bitrate = Number(data.format?.bit_rate ?? video.bit_rate ?? 0);

  return {
    filename,
    size: Number.isFinite(size) ? size : fallbackSize,
    duration: Number.isFinite(duration) ? duration : 0,
    width: video.width ?? 0,
    height: video.height ?? 0,
    fps: parseRate(video.avg_frame_rate),
    videoCodec: video.codec_name ?? null,
    audioCodec: audio?.codec_name ?? null,
    bitrate: Number.isFinite(bitrate) && bitrate > 0 ? bitrate : null,
    hasAudio: Boolean(audio),
  };
}

export async function detectFfmpeg(): Promise<{
  ffmpeg: boolean;
  version: string | null;
  codecs: Array<"h264" | "h265" | "av1">;
}> {
  try {
    const { stdout, stderr } = await execFileAsync("ffmpeg", ["-version"], {
      timeout: 5000,
    });
    const text = `${stdout}\n${stderr}`;
    const first = text.split("\n")[0] ?? "";
    const version = first.replace(/^ffmpeg version\s+/i, "").split(" ")[0] ?? null;
    return {
      ffmpeg: true,
      version,
      codecs: [
        text.includes("libx264") ? "h264" : null,
        text.includes("libx265") ? "h265" : null,
        text.includes("libsvtav1") || text.includes("libaom") ? "av1" : null,
      ].filter(Boolean) as Array<"h264" | "h265" | "av1">,
    };
  } catch {
    return { ffmpeg: false, version: null, codecs: [] };
  }
}
