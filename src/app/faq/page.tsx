import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { FAQ_ITEMS } from "@/content/faq";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "常见问题：接近无损、CRF、编码与隐私",
  description:
    "近原是否真正无损、CRF 数值含义、H.264 / H.265 / AV1 怎么选、会不会改分辨率，以及浏览器模式是否上传视频。",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: `常见问题 · ${SITE_NAME}`,
    description:
      "关于接近无损视频压缩、FFmpeg CRF、双路径编码和本地处理隐私的问答。",
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <main className="relative flex-1">
      <JsonLd data={faqJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "压缩", path: "/" },
          { name: "常见问题", path: "/faq" },
        ])}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,oklch(0.45_0.1_75_/_0.22),transparent_58%)]" />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            压缩
          </Link>
          <span aria-hidden="true"> / </span>
          常见问题
        </p>
        <h1 className="font-heading mt-3 text-4xl leading-tight tracking-tight sm:text-5xl">
          常见问题
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          每条都先给可引用的结论。更完整的编码说明见
          <Link
            href="/principles"
            className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            技术原理
          </Link>
          。
        </p>

        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/10 bg-white/5 px-5 py-4 open:bg-white/8"
            >
              <summary className="cursor-pointer list-none text-base font-medium marker:content-none">
                <span className="flex items-start justify-between gap-4">
                  {item.question}
                  <span className="text-muted-foreground group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
