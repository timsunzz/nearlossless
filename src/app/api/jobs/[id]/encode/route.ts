import { encodeJob } from "@/lib/encode-server";
import { getJob, publicJob, updateJob } from "@/lib/jobs";
import type { EncodeSettings } from "@/lib/types";
import { QUALITY_PRESETS } from "@/lib/presets";
import { isJobId } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CODECS = new Set(["h264", "h265", "av1"]);
const SCALES = new Set(["original", "1080", "720"]);

function parseSettings(input: unknown): EncodeSettings {
  const body = (input ?? {}) as Partial<EncodeSettings>;
  const quality = body.quality ?? "high";
  const codec = body.codec ?? "h264";
  const scale = body.scale ?? "original";
  if (!(quality in QUALITY_PRESETS)) {
    throw new Error("未知画质预设");
  }
  if (!CODECS.has(codec)) {
    throw new Error("不支持的编码格式");
  }
  if (!SCALES.has(scale)) {
    throw new Error("不支持的分辨率选项");
  }
  return {
    quality,
    codec,
    scale,
    copyAudio: body.copyAudio !== false,
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isJobId(id)) {
    return Response.json({ error: "无效任务" }, { status: 400 });
  }

  const job = getJob(id);
  if (!job) {
    return Response.json({ error: "任务不存在或已过期" }, { status: 404 });
  }
  if (job.status === "encoding") {
    return Response.json({ error: "正在压缩，请稍候" }, { status: 409 });
  }

  let settings: EncodeSettings;
  try {
    settings = parseSettings(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "参数无效";
    return Response.json({ error: message }, { status: 400 });
  }

  updateJob(id, {
    status: "encoding",
    progress: 0,
    error: null,
    settings,
    outputSize: null,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      send({ progress: 0, job: publicJob(getJob(id)!) });

      encodeJob(job, settings, (progress) => {
        send({ progress });
      })
        .then((result) => {
          const done = updateJob(id, {
            status: "done",
            progress: 1,
            outputSize: result.outputSize,
          });
          send({ done: true, progress: 1, outputSize: result.outputSize, job: publicJob(done) });
          controller.close();
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "压缩失败";
          updateJob(id, { status: "error", error: message });
          send({ error: message });
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    },
  });
}
