import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PRINCIPLES_INTRO, PRINCIPLES_SECTIONS } from "@/content/principles";
import { QUALITY_PRESETS } from "@/lib/presets";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, techArticleJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "技术原理：CRF 如何接近无损地压缩视频",
  description:
    "解释近原如何用 FFmpeg 或 ffmpeg.wasm 的 CRF 恒定质量，在默认不改变分辨率和帧率的前提下减小视频体积。",
  alternates: {
    canonical: "/principles",
  },
  openGraph: {
    title: `技术原理 · ${SITE_NAME}`,
    description:
      "CRF 恒定质量、服务器/浏览器双路径，以及近原各档 H.264 / H.265 / AV1 参数从何而来。",
    url: "/principles",
    type: "article",
  },
};

const presetRows = Object.values(QUALITY_PRESETS);

export default function PrinciplesPage() {
  return (
    <main className="relative flex-1">
      <JsonLd data={techArticleJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "压缩", path: "/" },
          { name: "技术原理", path: "/principles" },
        ])}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,oklch(0.45_0.1_75_/_0.22),transparent_58%)]" />

      <article className="relative mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            压缩
          </Link>
          <span aria-hidden="true"> / </span>
          技术原理
        </p>
        <h1 className="font-heading mt-3 text-4xl leading-tight tracking-tight sm:text-5xl">
          近原如何做到接近无损压缩
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          {PRINCIPLES_INTRO}
        </p>

        <nav
          aria-label="本文目录"
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="text-sm font-medium">目录</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            {PRINCIPLES_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {PRINCIPLES_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-20 border-t border-white/10 py-10"
          >
            <h2 className="font-heading text-2xl tracking-tight">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-base leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {section.id === "parameters" && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <caption className="bg-white/5 px-4 py-3 text-left font-medium text-foreground">
                    近原四档画质对应的 CRF（与代码预设同步）
                  </caption>
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-2 font-medium">模式</th>
                      <th className="px-4 py-2 font-medium">H.264</th>
                      <th className="px-4 py-2 font-medium">H.265</th>
                      <th className="px-4 py-2 font-medium">AV1</th>
                      <th className="px-4 py-2 font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presetRows.map((preset) => (
                      <tr
                        key={preset.id}
                        className="border-b border-white/8 last:border-0"
                      >
                        <td className="px-4 py-2">{preset.label}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {preset.crf.h264}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {preset.crf.h265}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {preset.crf.av1}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {preset.hint}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.bullets && (
              <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="border-t border-white/10 pt-8 text-sm text-muted-foreground">
          可以直接
          <Link
            href="/"
            className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            回去压缩
          </Link>
          ，或先看
          <Link
            href="/faq"
            className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            常见问题
          </Link>
          。给语言模型用的简报在
          <Link
            href="/llms.txt"
            className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            /llms.txt
          </Link>
          。
        </p>
      </article>
    </main>
  );
}
