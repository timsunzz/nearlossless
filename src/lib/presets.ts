import type { CodecId, QualityId, ScaleId } from "@/lib/types";

export type QualityPreset = {
  id: QualityId;
  label: string;
  hint: string;
  crf: Record<CodecId, number>;
  audioBitrate: string;
  speed: Record<CodecId, string>;
  wasmSpeed: Record<CodecId, string>;
};

export const QUALITY_PRESETS: Record<QualityId, QualityPreset> = {
  nearlossless: {
    id: "nearlossless",
    label: "近无损",
    hint: "CRF 很低，肉眼几乎看不出损失",
    crf: { h264: 16, h265: 20, av1: 22 },
    audioBitrate: "192k",
    speed: { h264: "slow", h265: "slow", av1: "4" },
    wasmSpeed: { h264: "medium", h265: "medium", av1: "6" },
  },
  high: {
    id: "high",
    label: "高画质",
    hint: "推荐默认。体积下降，观感几乎不变",
    crf: { h264: 18, h265: 22, av1: 26 },
    audioBitrate: "160k",
    speed: { h264: "slow", h265: "medium", av1: "6" },
    wasmSpeed: { h264: "medium", h265: "medium", av1: "8" },
  },
  balanced: {
    id: "balanced",
    label: "均衡",
    hint: "体积明显变小，细节仍清楚",
    crf: { h264: 23, h265: 28, av1: 32 },
    audioBitrate: "128k",
    speed: { h264: "medium", h265: "medium", av1: "7" },
    wasmSpeed: { h264: "veryfast", h265: "fast", av1: "10" },
  },
  light: {
    id: "light",
    label: "轻量",
    hint: "优先缩小文件，适合发送和存档",
    crf: { h264: 28, h265: 32, av1: 36 },
    audioBitrate: "96k",
    speed: { h264: "medium", h265: "medium", av1: "8" },
    wasmSpeed: { h264: "veryfast", h265: "fast", av1: "10" },
  },
};

export const CODEC_OPTIONS: {
  id: CodecId;
  label: string;
  hint: string;
  serverOnly?: boolean;
}[] = [
  { id: "h264", label: "H.264", hint: "兼容最好，手机电脑都能播" },
  { id: "h265", label: "H.265", hint: "同样画质，文件通常更小" },
  { id: "av1", label: "AV1", hint: "最省体积，编码更慢", serverOnly: true },
];

export const SCALE_OPTIONS: { id: ScaleId; label: string; hint: string }[] = [
  { id: "original", label: "原始分辨率", hint: "不缩放，只重编码" },
  { id: "1080", label: "最高 1080p", hint: "大于 1080p 时缩小" },
  { id: "720", label: "最高 720p", hint: "适合手机观看" },
];

export const DEFAULT_SETTINGS = {
  quality: "high" as QualityId,
  codec: "h264" as CodecId,
  scale: "original" as ScaleId,
  copyAudio: true,
};
