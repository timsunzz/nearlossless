import type { Metadata } from "next";
import Link from "next/link";
import { Geist_Mono, Instrument_Serif, Noto_Sans_SC } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  NAV_ITEMS,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/site";
import {
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/structured-data";
import "./globals.css";

const sans = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} · ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  other: {
    google: "notranslate",
    "ai-content-declaration":
      "Original technical documentation about CRF video compression for humans and generative engines. See /llms.txt.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      translate="no"
      className={`notranslate ${sans.variable} ${serif.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={softwareJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
        >
          跳到主要内容
        </a>
        <TooltipProvider>
          <div className="relative flex min-h-svh flex-1 flex-col">
            <div className="grain pointer-events-none fixed inset-0 z-0 opacity-30" />
            <div className="relative z-10 flex min-h-svh flex-1 flex-col">
              <SiteHeader />
              <div id="main" className="flex flex-1 flex-col">
                {children}
              </div>
              <SiteFooter />
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-white/8">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
          <span className="font-heading text-lg tracking-wide">{SITE_NAME}</span>
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-4 text-xs sm:text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <p className="max-w-lg">
          临时文件会在服务器上保留最多一小时。浏览器模式不会上传视频。基于
          FFmpeg · CRF 恒定质量。
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/principles" className="hover:text-foreground">
            技术原理
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            常见问题
          </Link>
          <Link href="/llms.txt" className="hover:text-foreground">
            llms.txt
          </Link>
        </div>
      </div>
    </footer>
  );
}
