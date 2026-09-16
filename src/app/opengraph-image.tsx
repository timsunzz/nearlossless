import { ImageResponse } from "next/og";
import { QUALITY_PRESETS } from "@/lib/presets";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "近原 · 接近无损的视频压缩";

async function loadNotoSansSc(text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@600;700&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((response) => response.text());

  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match?.[1]) {
    throw new Error("无法解析中文字体");
  }

  const fontResponse = await fetch(match[1]);
  if (!fontResponse.ok) {
    throw new Error("无法下载中文字体");
  }

  return fontResponse.arrayBuffer();
}

export default async function OpenGraphImage() {
  const title = "近原";
  const subtitle = "把体积压下去，把画质留下来。";
  const crf = QUALITY_PRESETS.high.crf.h264;
  const detail = `FFmpeg CRF ${crf} · H.264 / H.265 / AV1 · 默认可不降分辨率`;
  const fontData = await loadNotoSansSc(`${title}${subtitle}${detail}Near`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(165deg, #1a1610 0%, #241c14 52%, #3a2a18 100%)",
          color: "#f6f0e6",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            opacity: 0.7,
          }}
        >
          NEAR
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 600 }}>
            {subtitle}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              opacity: 0.78,
              marginTop: 8,
            }}
          >
            {detail}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans SC",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
