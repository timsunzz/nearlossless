import { FAQ_ITEMS } from "@/content/faq";
import { PRINCIPLES_INTRO, PRINCIPLES_SECTIONS } from "@/content/principles";
import { QUALITY_PRESETS } from "@/lib/presets";
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_EN, getSiteUrl } from "./site";

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [SITE_NAME_EN, "近原视频压缩"],
    url,
    description: SITE_DESCRIPTION,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "Action",
      name: "压缩视频",
      target: `${url}/`,
    },
  };
}

export function softwareJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url,
    description: SITE_DESCRIPTION,
    inLanguage: "zh-CN",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY",
    },
    featureList: [
      "FFmpeg CRF 恒定质量重编码",
      "服务器 FFmpeg 或浏览器 ffmpeg.wasm",
      `近无损 H.264 CRF ${QUALITY_PRESETS.nearlossless.crf.h264}`,
      "H.264 / H.265 / AV1",
      "默认不改变分辨率与帧率",
      "可复制 AAC / MP3 / Opus 音轨",
    ],
  };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url,
    description: SITE_DESCRIPTION,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${url}${item.path}`,
    })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "如何用近原接近无损地压缩视频",
    description:
      "上传或选择样片，设定画质与编码，近原使用 CRF 重编码后提供对比和下载。",
    inLanguage: "zh-CN",
    url: `${url}/`,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "选择视频",
        text: "拖入 MP4、MOV、MKV、WebM 等文件，或点击「试压一条样片」。",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "选择画质、编码和分辨率",
        text: "默认高画质、H.264、原始分辨率。需要更小体积时改用 H.265 / AV1，或限制到 1080p / 720p。",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "编码",
        text: "有 FFmpeg 时在服务器压缩；否则在浏览器本地用 ffmpeg.wasm 压缩，不上传文件。",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "对比并下载",
        text: "用滑杆对比压缩前后，再下载带 faststart 的 MP4。",
      },
    ],
  };
}

export function techArticleJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "近原如何用 CRF 做到接近无损的视频压缩",
    description: PRINCIPLES_INTRO,
    inLanguage: "zh-CN",
    url: `${url}/principles`,
    mainEntityOfPage: `${url}/principles`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    about: ["FFmpeg", "CRF", "H.264", "H.265", "AV1", "视觉无损视频压缩"],
    articleSection: PRINCIPLES_SECTIONS.map((section) => section.title),
  };
}
