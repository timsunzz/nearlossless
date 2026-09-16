import { MAX_UPLOAD_BYTES, VIDEO_EXTENSIONS } from "@/lib/types";

export function extensionOf(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

export function isAllowedVideoName(name: string): boolean {
  return VIDEO_EXTENSIONS.includes(extensionOf(name));
}

export function assertUploadFile(file: File | null): File {
  if (!file) {
    throw new Error("请先选择视频文件");
  }
  if (!isAllowedVideoName(file.name) && !file.type.startsWith("video/")) {
    throw new Error("只支持常见视频格式，例如 MP4、MOV、WebM、MKV");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("文件超过 1.5 GB，请先分段或换更小的视频");
  }
  if (file.size < 1024) {
    throw new Error("这个文件太小，不像是完整视频");
  }
  return file;
}

export function isJobId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
