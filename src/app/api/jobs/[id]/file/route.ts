import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { getJob } from "@/lib/jobs";
import { outputFilename } from "@/lib/format";
import { isJobId } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isJobId(id)) {
    return Response.json({ error: "无效任务" }, { status: 400 });
  }
  const job = getJob(id);
  if (!job || job.status !== "done" || !job.outputSize) {
    return Response.json({ error: "还没有可下载的结果" }, { status: 404 });
  }

  const nodeStream = createReadStream(job.outputPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  const filename = outputFilename(job.originalName, job.settings?.codec ?? "h264");

  return new Response(webStream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(job.outputSize),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
