"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  LoaderCircle,
  RotateCcw,
  Shield,
  Sparkles,
  Clapperboard,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { CompareSlider } from "@/components/compare-slider";
import { DropZone } from "@/components/drop-zone";
import { encodeInBrowser, loadClientFfmpeg } from "@/lib/client-ffmpeg";
import { fallbackMeta, readVideoMeta } from "@/lib/client-meta";
import {
  formatBytes,
  formatDuration,
  formatFps,
  outputFilename,
  savingsPercent,
} from "@/lib/format";
import {
  CODEC_OPTIONS,
  DEFAULT_SETTINGS,
  QUALITY_PRESETS,
  SCALE_OPTIONS,
} from "@/lib/presets";
import type {
  CodecId,
  EncodeSettings,
  HealthResponse,
  QualityId,
  ScaleId,
  VideoMeta,
} from "@/lib/types";
import { MAX_WASM_BYTES } from "@/lib/types";
import { assertUploadFile } from "@/lib/validate";
import { cn } from "@/lib/utils";

type Phase = "idle" | "selected" | "working" | "done";

type ResultState = {
  url: string;
  filename: string;
  outputSize: number;
};

type CompressorProps = {
  initialHealth?: HealthResponse | null;
};

export function Compressor({ initialHealth = null }: CompressorProps) {
  const [health, setHealth] = useState<HealthResponse | null>(initialHealth);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [settings, setSettings] = useState<EncodeSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({ ffmpeg: false, version: null, codecs: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [originalUrl, result?.url]);

  const serverReady = Boolean(health?.ffmpeg);
  const availableCodecs = useMemo<CodecId[]>(() => {
    if (serverReady) return health?.codecs.length ? health.codecs : ["h264"];
    return ["h264"];
  }, [health, serverReady]);

  const activeCodec: CodecId = availableCodecs.includes(settings.codec)
    ? settings.codec
    : (availableCodecs[0] ?? "h264");
  const activeSettings: EncodeSettings = { ...settings, codec: activeCodec };

  async function loadSample() {
    try {
      setSampleLoading(true);
      setError(null);
      const response = await fetch("/sample.mp4", { cache: "force-cache" });
      if (!response.ok) {
        throw new Error("样片加载失败，请直接选择自己的视频");
      }
      const blob = await response.blob();
      if (blob.size < 1024) {
        throw new Error("样片加载不完整，请直接选择自己的视频");
      }
      await handleFile(new File([blob], "sample.mp4", { type: "video/mp4" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "样片加载失败");
    } finally {
      setSampleLoading(false);
    }
  }

  async function handleFile(next: File) {
    try {
      assertUploadFile(next);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult(null);
      setJobId(null);
      setError(null);
      setProgress(0);
      const url = URL.createObjectURL(next);
      setFile(next);
      setOriginalUrl(url);
      setMeta(fallbackMeta(next));
      setPhase("selected");
      const probed = await readVideoMeta(next);
      setMeta(probed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法读取这个文件");
      setPhase("idle");
    }
  }

  async function startCompress() {
    if (!file || !meta) return;
    setError(null);
    setPhase("working");
    setProgress(0);

    try {
      if (serverReady) {
        await compressOnServer(file);
      } else {
        if (file.size > MAX_WASM_BYTES) {
          throw new Error("浏览器压缩建议不超过 400 MB。请在带 FFmpeg 的服务器上运行本项目。");
        }
        await compressInBrowser(file, meta);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "压缩失败");
      setPhase(file ? "selected" : "idle");
    }
  }

  async function compressOnServer(current: File) {
    setStatusText("正在上传并分析视频…");
    const form = new FormData();
    form.append("file", current);
    const created = await fetch("/api/jobs", { method: "POST", body: form });
    const createdBody = await created.json();
    if (!created.ok) {
      throw new Error(createdBody.error ?? "上传失败");
    }
    const id = createdBody.job.id as string;
    setJobId(id);
    if (createdBody.job.meta) {
      setMeta(createdBody.job.meta);
    }

    setStatusText("正在按恒定质量重编码…");
    const encode = await fetch(`/api/jobs/${id}/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activeSettings),
    });
    if (!encode.ok || !encode.body) {
      const failed = await encode.json().catch(() => ({}));
      throw new Error(failed.error ?? "无法开始压缩");
    }

    await readSse(encode.body, (event) => {
      if (typeof event.progress === "number") {
        setProgress(event.progress);
      }
      if (event.error) {
        throw new Error(event.error);
      }
    });

    setStatusText("正在准备下载…");
    const fileRes = await fetch(`/api/jobs/${id}/file`);
    if (!fileRes.ok) {
      throw new Error("压缩完成，但下载失败");
    }
    const blob = await fileRes.blob();
    finishResult(blob, outputFilename(current.name, activeCodec));
  }

  async function compressInBrowser(current: File, currentMeta: VideoMeta) {
    setStatusText("正在加载浏览器编码器（约 30MB，只需一次）…");
    await loadClientFfmpeg();
    setStatusText("正在本机压缩，视频不会上传…");
    const encoded = await encodeInBrowser(
      current,
      currentMeta,
      activeSettings,
      setProgress,
    );
    finishResult(encoded.blob, encoded.filename);
  }

  function finishResult(blob: Blob, filename: string) {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult({
      url: URL.createObjectURL(blob),
      filename,
      outputSize: blob.size,
    });
    setProgress(1);
    setPhase("done");
    setStatusText("压缩完成");
  }

  function reset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    if (jobId) {
      void fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    }
    setFile(null);
    setOriginalUrl(null);
    setMeta(null);
    setResult(null);
    setJobId(null);
    setError(null);
    setProgress(0);
    setPhase("idle");
  }

  const saved =
    file && result ? savingsPercent(file.size, result.outputSize) : 0;

  return (
    <div className="space-y-8" data-testid="compressor" data-phase={phase}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={serverReady ? "default" : "secondary"}>
          {serverReady ? "服务器 FFmpeg" : "浏览器本地压缩"}
        </Badge>
        <Badge variant="outline">
          {serverReady
            ? `x264 / x265${health?.codecs.includes("av1") ? " / AV1" : ""}`
            : "H.264 · 视频不离开这台设备"}
        </Badge>
      </div>

      {phase === "idle" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="lg"
              data-testid="sample-video-button"
              disabled={sampleLoading}
              onClick={() => void loadSample()}
            >
              {sampleLoading ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <Clapperboard data-icon="inline-start" />
              )}
              {sampleLoading ? "正在加载样片…" : "试压一条样片"}
            </Button>
            <p className="text-sm text-muted-foreground">
              先用自带的高码率测试片走一遍，不必打开系统文件框。
            </p>
          </div>
          <DropZone onFile={handleFile} error={error} disabled={sampleLoading} />
        </div>
      ) : null}

      {file && meta && phase !== "idle" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-6">
            {phase === "done" && result && originalUrl ? (
              <CompareSlider originalUrl={originalUrl} compressedUrl={result.url} />
            ) : originalUrl ? (
              <video
                src={originalUrl}
                controls
                playsInline
                className="aspect-video w-full rounded-2xl bg-black object-contain ring-1 ring-white/10"
              />
            ) : null}

            {phase === "working" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin text-primary" />
                    {statusText}
                  </CardTitle>
                  <CardDescription>
                    使用恒定质量（CRF）编码：画面简单的段落少占空间，复杂运动才多给码率。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={Math.round(progress * 100)}>
                    <ProgressLabel>压缩进度</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                </CardContent>
              </Card>
            ) : null}

            {phase === "done" && result && file ? (
              <Card className="bg-[oklch(0.24_0.03_75)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    体积下来了，画质按你选的预设尽量保住
                  </CardTitle>
                  <CardDescription>
                    {saved > 0
                      ? `大约减少了 ${saved}%。拖动上方滑杆对比原片和压缩结果。`
                      : "这段视频可能已经压过，体积没有再降下来。仍可下载重编码后的文件。"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Stat label="原来" value={formatBytes(file.size)} />
                  <Stat label="现在" value={formatBytes(result.outputSize)} />
                  <Stat
                    label="变化"
                    value={saved > 0 ? `−${saved}%` : saved < 0 ? `+${Math.abs(saved)}%` : "持平"}
                  />
                </CardContent>
              </Card>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>压缩没有完成</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {phase === "selected" ? (
                <Button
                  size="lg"
                  data-testid="compress-button"
                  onClick={startCompress}
                >
                  <Sparkles data-icon="inline-start" />
                  开始接近无损压缩
                </Button>
              ) : null}
              {phase === "done" && result ? (
                <a
                  href={result.url}
                  download={result.filename}
                  data-testid="download-result"
                  className={buttonVariants({ size: "lg" })}
                >
                  <Download data-icon="inline-start" />
                  下载压缩结果
                </a>
              ) : null}
              <Button
                size="lg"
                variant="outline"
                data-testid="reset-button"
                onClick={reset}
                disabled={phase === "working"}
              >
                <RotateCcw data-icon="inline-start" />
                换一条视频
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>视频信息</CardTitle>
                <CardDescription className="break-all">{meta.filename}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Meta label="大小" value={formatBytes(meta.size)} />
                <Meta label="时长" value={formatDuration(meta.duration)} />
                <Meta
                  label="分辨率"
                  value={meta.width && meta.height ? `${meta.width}×${meta.height}` : "—"}
                />
                <Meta label="帧率" value={formatFps(meta.fps)} />
                <Meta label="视频编码" value={meta.videoCodec ?? "读取中"} />
                <Meta label="音频" value={meta.audioCodec ?? (meta.hasAudio ? "有音轨" : "无")} />
              </CardContent>
            </Card>

            <fieldset disabled={phase === "working"} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>画质预设</CardTitle>
                  <CardDescription>数字越低越接近原片，文件也越大。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {(Object.values(QUALITY_PRESETS) as typeof QUALITY_PRESETS.high[]).map(
                    (preset) => (
                      <OptionButton
                        key={preset.id}
                        active={settings.quality === preset.id}
                        title={preset.label}
                        hint={preset.hint}
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            quality: preset.id as QualityId,
                          }))
                        }
                      />
                    ),
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>编码与尺寸</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {CODEC_OPTIONS.map((codec) => {
                      const enabled =
                        availableCodecs.includes(codec.id) &&
                        (!codec.serverOnly || serverReady);
                      return (
                        <Button
                          key={codec.id}
                          type="button"
                          size="sm"
                          variant={activeCodec === codec.id ? "default" : "outline"}
                          disabled={!enabled}
                          onClick={() =>
                            setSettings((current) => ({
                              ...current,
                              codec: codec.id,
                            }))
                          }
                        >
                          {codec.label}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {CODEC_OPTIONS.find((item) => item.id === activeCodec)?.hint}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SCALE_OPTIONS.map((scale) => (
                      <Button
                        key={scale.id}
                        type="button"
                        size="sm"
                        variant={settings.scale === scale.id ? "default" : "outline"}
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            scale: scale.id as ScaleId,
                          }))
                        }
                      >
                        {scale.label}
                      </Button>
                    ))}
                  </div>
                  <label className="flex items-start gap-2 text-sm leading-6">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-[var(--primary)]"
                      checked={settings.copyAudio}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          copyAudio: event.target.checked,
                        }))
                      }
                    />
                    <span>音频尽量原样复制，避免再损一代</span>
                  </label>
                </CardContent>
              </Card>
            </fieldset>

            <Alert>
              <Shield className="size-4" />
              <AlertTitle>怎么做到“接近无损”</AlertTitle>
              <AlertDescription>
                不靠死压码率，而是用 CRF 恒定质量。默认高画质相当于 H.264 CRF
                18，这是常见的“视觉无损”区间：分辨率、帧率保持原样，只去掉人眼不容易察觉的冗余。
              </AlertDescription>
            </Alert>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-heading text-2xl tracking-tight">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function OptionButton({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-primary/60 bg-primary/10"
          : "border-white/10 hover:border-white/20 hover:bg-white/5",
      )}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
        {hint}
      </span>
    </button>
  );
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: { progress?: number; error?: string; done?: boolean }) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6)) as {
        progress?: number;
        error?: string;
        done?: boolean;
      };
      onEvent(event);
      if (event.error) return;
    }
  }
}
