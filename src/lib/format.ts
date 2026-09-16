export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatFps(fps: number | null): string {
  if (!fps) return "—";
  return Number.isInteger(fps) ? `${fps} fps` : `${fps.toFixed(2)} fps`;
}

export function savingsPercent(original: number, compressed: number): number {
  if (original <= 0) return 0;
  return Math.round((1 - compressed / original) * 100);
}

export function outputFilename(originalName: string, codec: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "video";
  const safe = base.replace(/[^\w\u4e00-\u9fff.-]+/g, "_");
  return `${safe}-near.${codec === "h265" ? "mp4" : "mp4"}`;
}
