import type { VideoMeta } from "@/lib/types";

export function fallbackMeta(file: File): VideoMeta {
  return {
    filename: file.name,
    size: file.size,
    duration: 0,
    width: 0,
    height: 0,
    fps: null,
    videoCodec: null,
    audioCodec: null,
    bitrate: null,
    hasAudio: true,
  };
}

export function readVideoMeta(file: File): Promise<VideoMeta> {
  const fallback = fallbackMeta(file);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.style.position = "fixed";
    video.style.left = "-2000px";
    video.style.width = "16px";
    video.style.height = "16px";

    let settled = false;
    const finish = (meta: VideoMeta) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      resolve(meta);
    };

    const timer = window.setTimeout(() => finish(fallback), 3500);

    video.onloadedmetadata = () => {
      finish({
        ...fallback,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
        bitrate:
          Number.isFinite(video.duration) && video.duration > 0
            ? Math.round((file.size * 8) / video.duration)
            : null,
      });
    };

    video.onerror = () => finish(fallback);
    document.body.appendChild(video);
    video.src = url;
  });
}
