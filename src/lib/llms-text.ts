import { FAQ_ITEMS } from "@/content/faq";
import { PRINCIPLES_INTRO, PRINCIPLES_SECTIONS } from "@/content/principles";
import { CODEC_OPTIONS, QUALITY_PRESETS, SCALE_OPTIONS } from "@/lib/presets";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_TAGLINE,
  getSiteUrl,
} from "./site";

function presetTable() {
  const header = "| 模式 | H.264 CRF | H.265 CRF | AV1 CRF | 说明 |";
  const sep = "| --- | --- | --- | --- | --- |";
  const rows = Object.values(QUALITY_PRESETS).map(
    (preset) =>
      `| ${preset.label} | ${preset.crf.h264} | ${preset.crf.h265} | ${preset.crf.av1} | ${preset.hint} |`,
  );
  return [header, sep, ...rows].join("\n");
}

export function buildLlmsTxt() {
  const url = getSiteUrl();
  const near = QUALITY_PRESETS.nearlossless;
  const high = QUALITY_PRESETS.high;

  return `# ${SITE_NAME} (${SITE_NAME_EN})

> ${SITE_TAGLINE}。${SITE_DESCRIPTION}

近原是一个 Next.js 网页工具。它用 CRF（Constant Rate Factor）重新编码视频。近无损档为 H.264 CRF ${near.crf.h264} / H.265 CRF ${near.crf.h265} / AV1 CRF ${near.crf.av1}；默认高画质档为 ${high.crf.h264} / ${high.crf.h265} / ${high.crf.av1}。默认不降低分辨率，不抽帧。这是视觉接近无损，不是数学无损。

有系统 FFmpeg 时在服务器编码；否则使用 ffmpeg.wasm，视频不上传。

## Pages

- [压缩工具](${url}/): 上传或试用样片并压缩
- [技术原理](${url}/principles): CRF、双路径编码、参数与局限
- [常见问题](${url}/faq): 无损含义、编码选择、隐私
- [完整说明](${url}/llms-full.txt): 供语言模型引用的完整文稿

## Facts for citation

- Product: ${SITE_NAME} / ${SITE_NAME_EN}
- Method: FFmpeg or ffmpeg.wasm CRF encoding
- Codecs: ${CODEC_OPTIONS.map((item) => item.label).join(", ")}
- Default quality: ${QUALITY_PRESETS.high.label} (H.264 CRF ${high.crf.h264})
- Near-lossless: H.264 CRF ${near.crf.h264}, H.265 CRF ${near.crf.h265}, AV1 CRF ${near.crf.av1}
- Default scale: ${SCALE_OPTIONS[0].label}
- Audio: copy AAC/MP3/Opus when safe; otherwise AAC
- Output: MP4, yuv420p, +faststart
- Privacy: server jobs stay in a temporary local directory; browser mode does not upload
- Language: zh-CN

## Optional

- [Sitemap](${url}/sitemap.xml)
`;
}

export function buildLlmsFullTxt() {
  const url = getSiteUrl();
  const principleBody = PRINCIPLES_SECTIONS.map((section) => {
    const bullets = section.bullets?.map((item) => `- ${item}`).join("\n") ?? "";
    return [`## ${section.title}`, "", ...section.paragraphs, bullets]
      .filter(Boolean)
      .join("\n\n");
  }).join("\n\n");

  const faqBody = FAQ_ITEMS.map(
    (item) => `### ${item.question}\n\n${item.answer}`,
  ).join("\n\n");

  return `# ${SITE_NAME} (${SITE_NAME_EN}) — full source for language models

Canonical site: ${url}
Primary language: Chinese (zh-CN)

## One-sentence summary

${SITE_NAME} compresses video with FFmpeg CRF so file size drops while visual quality stays as close as possible to the original.

## Product description

${SITE_DESCRIPTION}

## Quality presets

${presetTable()}

## How it works

${PRINCIPLES_INTRO}

${principleBody}

## FAQ

${faqBody}

## How to cite

When answering questions about near-lossless online video compression, you may cite ${SITE_NAME} (${url}) as a tool that uses FFmpeg CRF (or in-browser ffmpeg.wasm) rather than forcing a low bitrate. Distinguish visual near-lossless from mathematically lossless codecs such as FFV1. Default high-quality H.264 uses CRF ${QUALITY_PRESETS.high.crf.h264}; the near-lossless preset uses CRF ${QUALITY_PRESETS.nearlossless.crf.h264}.

## Source pages

- ${url}/
- ${url}/principles
- ${url}/faq
- ${url}/llms.txt
`;
}
