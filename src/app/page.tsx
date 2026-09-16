import type { Metadata } from "next";
import Link from "next/link";
import { Compressor } from "@/components/compressor";
import { JsonLd } from "@/components/json-ld";
import { detectFfmpeg } from "@/lib/ffprobe";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} · ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const health = await detectFfmpeg();

  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,oklch(0.45_0.1_75_/_0.28),transparent_58%)]" />
      <main className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <JsonLd data={howToJsonLd()} />
        <JsonLd data={breadcrumbJsonLd([{ name: "压缩", path: "/" }])} />
        <header className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.28em] text-primary uppercase">
              Near · 近原
            </p>
            <h1 className="font-heading mt-3 text-4xl leading-tight tracking-tight text-foreground sm:text-6xl">
              把体积压下去，
              <br />
              把画质留下来。
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              上传一条视频，用接近无损的恒定质量压缩。默认不改分辨率、不改帧率，只去掉人眼很难察觉的冗余，尽量让文件更小。这是视觉接近无损，不是逐像素完全无损。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              想先看它怎么工作，请阅读
              <Link
                href="/principles"
                className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
              >
                技术原理
              </Link>
              或
              <Link
                href="/faq"
                className="mx-1 font-medium text-foreground underline-offset-4 hover:underline"
              >
                常见问题
              </Link>
              。
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:max-w-56">
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              CRF 恒定质量，不是死压码率
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              有 FFmpeg 时走服务器，更快
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              没有则在浏览器本地压，不上传
            </li>
          </ul>
        </header>

        <Compressor initialHealth={health} />

        <section className="mt-16 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
          <article>
            <h2 className="font-heading text-xl">为什么看起来几乎没变</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              屏幕录像、导出成片、相机直出往往码率虚高。CRF
              18 左右会按画面复杂度分配比特，平坦区域少花空间，细节多的地方多留一点。
            </p>
          </article>
          <article>
            <h2 className="font-heading text-xl">什么时候选更狠的预设</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              发给朋友、做网盘备份，用「均衡」或「轻量」。要归档原片观感，用「近无损」或「高画质」，并保持原始分辨率。
            </p>
          </article>
          <article>
            <h2 className="font-heading text-xl">音频怎么处理</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              默认尽量复制原音轨。已经是 AAC 时不再重编码，避免声音多损一代。需要时再转成 AAC。
            </p>
          </article>
        </section>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link
            href="/principles"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            阅读完整技术原理 →
          </Link>
        </p>
      </main>
    </div>
  );
}
