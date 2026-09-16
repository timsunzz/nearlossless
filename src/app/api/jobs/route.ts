import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { createJob, publicJob } from "@/lib/jobs";
import { probeVideo } from "@/lib/ffprobe";
import { assertUploadFile } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = assertUploadFile(form.get("file") as File | null);
    const id = randomUUID();
    const job = await createJob(id, file.name, {
      filename: file.name,
      size: file.size,
      duration: 0,
      width: 0,
      height: 0,
      fps: null,
      videoCodec: null,
      audioCodec: null,
      bitrate: null,
      hasAudio: false,
    });

    await pipeline(
      Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream),
      createWriteStream(job.inputPath),
    );

    const meta = await probeVideo(job.inputPath, file.name, file.size);
    const ready = { ...job, meta };
    Object.assign(job, { meta });

    return Response.json({ job: publicJob(ready) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    return Response.json({ error: message }, { status: 400 });
  }
}
