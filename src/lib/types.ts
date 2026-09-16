export type QualityId = "nearlossless" | "high" | "balanced" | "light";
export type CodecId = "h264" | "h265" | "av1";
export type ScaleId = "original" | "1080" | "720";

export type VideoMeta = {
  filename: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  fps: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  bitrate: number | null;
  hasAudio: boolean;
};

export type EncodeSettings = {
  quality: QualityId;
  codec: CodecId;
  scale: ScaleId;
  copyAudio: boolean;
};

export type HealthResponse = {
  ffmpeg: boolean;
  version: string | null;
  codecs: CodecId[];
};

export type EncodeResult = {
  outputSize: number;
  filename: string;
};

export const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024 * 1024;
export const MAX_WASM_BYTES = 400 * 1024 * 1024;

export const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".m4v",
  ".mpeg",
  ".mpg",
  ".3gp",
  ".wmv",
];
