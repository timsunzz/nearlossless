import { detectFfmpeg } from "@/lib/ffprobe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await detectFfmpeg();
  return Response.json(health);
}
