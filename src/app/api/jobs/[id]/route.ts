import { deleteJob, getJob, publicJob } from "@/lib/jobs";
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
  if (!job) {
    return Response.json({ error: "任务不存在或已过期" }, { status: 404 });
  }
  return Response.json({ job: publicJob(job) });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isJobId(id)) {
    return Response.json({ error: "无效任务" }, { status: 400 });
  }
  await deleteJob(id);
  return Response.json({ ok: true });
}
