import { QUALITY_PRESETS } from "@/lib/presets";
import type { EncodeSettings } from "@/lib/types";

const COPYABLE_AUDIO = new Set([
  "aac",
  "mp4a",
  "mp3",
  "mp4a.40.2",
  "opus",
]);

type BuildOptions = {
  input: string;
  output: string;
  settings: EncodeSettings;
  hasAudio: boolean;
  audioCodec: string | null;
  fast?: boolean;
};

export function buildEncodeArgs({
  input,
  output,
  settings,
  hasAudio,
  audioCodec,
  fast = false,
}: BuildOptions): string[] {
  const preset = QUALITY_PRESETS[settings.quality];
  const crf = String(preset.crf[settings.codec]);
  const speed = fast
    ? preset.wasmSpeed[settings.codec]
    : preset.speed[settings.codec];

  const args = ["-hide_banner", "-y", "-i", input, "-map", "0:v:0"];

  if (hasAudio) {
    args.push("-map", "0:a:0?");
  }

  if (settings.codec === "h265") {
    args.push(
      "-c:v",
      "libx265",
      "-preset",
      speed,
      "-crf",
      crf,
      "-tag:v",
      "hvc1",
      "-pix_fmt",
      "yuv420p",
    );
  } else if (settings.codec === "av1") {
    args.push(
      "-c:v",
      "libsvtav1",
      "-crf",
      crf,
      "-preset",
      speed,
      "-pix_fmt",
      "yuv420p",
    );
  } else {
    args.push(
      "-c:v",
      "libx264",
      "-preset",
      speed,
      "-crf",
      crf,
      "-pix_fmt",
      "yuv420p",
    );
  }

  const scaleFilter = scaleExpression(settings.scale);
  if (scaleFilter) {
    args.push("-vf", scaleFilter);
  }

  if (hasAudio) {
    const codecName = (audioCodec ?? "").toLowerCase();
    const canCopy =
      settings.copyAudio &&
      COPYABLE_AUDIO.has(codecName) &&
      settings.codec !== "av1";

    if (canCopy) {
      args.push("-c:a", "copy");
    } else {
      args.push("-c:a", "aac", "-b:a", preset.audioBitrate);
    }
  }

  args.push("-movflags", "+faststart", "-map_metadata", "0", output);
  return args;
}

function scaleExpression(scale: EncodeSettings["scale"]): string | null {
  if (scale === "original") return null;
  const maxWidth = scale === "1080" ? 1920 : 1280;
  const maxHeight = scale === "1080" ? 1080 : 720;
  return `scale=w='min(iw,${maxWidth})':h='min(ih,${maxHeight})':force_original_aspect_ratio=decrease:force_divisible_by=2`;
}
