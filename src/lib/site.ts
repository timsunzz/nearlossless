export const SITE_NAME = "近原";
export const SITE_NAME_EN = "Near";
export const SITE_TAGLINE = "接近无损的视频压缩";
export const SITE_DESCRIPTION =
  "近原用 FFmpeg 的 CRF 恒定质量压缩视频：默认不改分辨率和帧率，只去掉人眼很难察觉的冗余。有本机 FFmpeg 时走服务器编码（H.264 / H.265 / AV1）；没有则在浏览器本地压缩，视频不会上传。";

export const SITE_KEYWORDS = [
  "视频压缩",
  "在线压缩视频",
  "接近无损",
  "近无损压缩",
  "减小视频体积",
  "不损失画质",
  "FFmpeg CRF",
  "H.264",
  "H.265",
  "AV1",
  "近原",
];

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /\/$/,
    "",
  );
  if (production) return `https://${production}`;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://127.0.0.1:43173";
}

export const NAV_ITEMS = [
  { href: "/", label: "压缩" },
  { href: "/principles", label: "原理" },
  { href: "/faq", label: "问答" },
] as const;
