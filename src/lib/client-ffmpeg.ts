import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { buildEncodeArgs } from "@/lib/encode-args";
import { outputFilename } from "@/lib/format";
import type { EncodeSettings, VideoMeta } from "@/lib/types";

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export async function loadClientFfmpeg(
  onLog?: (message: string) => void,
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (loading) return loading;

  loading = (async () => {
    const instance = new FFmpeg();
    if (onLog) {
      instance.on("log", ({ message }) => onLog(message));
    }
    const coreURL = await toBlobURL(
      `${CORE_BASE}/ffmpeg-core.js`,
      "text/javascript",
    );
    const wasmURL = await toBlobURL(
      `${CORE_BASE}/ffmpeg-core.wasm`,
      "application/wasm",
    );
    await instance.load({ coreURL, wasmURL });
    ffmpeg = instance;
    return instance;
  })();

  try {
    return await loading;
  } finally {
    loading = null;
  }
}

export async function encodeInBrowser(
  file: File,
  meta: VideoMeta,
  settings: EncodeSettings,
  onProgress: (progress: number) => void,
): Promise<{ blob: Blob; filename: string; outputSize: number }> {
  const instance = await loadClientFfmpeg();
  const inputName = `input${extensionFromName(file.name)}`;
  const outputName = "output.mp4";

  instance.on("progress", ({ progress }) => {
    if (Number.isFinite(progress)) {
      onProgress(Math.min(0.99, Math.max(0, progress)));
    }
  });

  await instance.writeFile(inputName, await fetchFile(file));

  const args = buildEncodeArgs({
    input: inputName,
    output: outputName,
    settings: settings.codec === "av1" ? { ...settings, codec: "h264" } : settings,
    hasAudio: meta.hasAudio,
    audioCodec: meta.audioCodec,
    fast: true,
  });

  const code = await instance.exec(args);
  if (code !== 0) {
    throw new Error("浏览器编码失败，请改用更短的视频或换高画质预设");
  }

  const data = await instance.readFile(outputName);
  await instance.deleteFile(inputName).catch(() => undefined);
  await instance.deleteFile(outputName).catch(() => undefined);
  instance.off("progress", () => undefined);

  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: "video/mp4" });
  onProgress(1);
  return {
    blob,
    filename: outputFilename(file.name, settings.codec),
    outputSize: blob.size,
  };
}

function extensionFromName(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index) : ".mp4";
}
