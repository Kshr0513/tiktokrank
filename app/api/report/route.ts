import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/ipHash";
import { isRateLimited } from "@/lib/rateLimit";

const BodySchema = z.object({
  videoId: z.string().min(1).max(50),
  reason: z.string().min(1).max(500),
});

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const ip = getIp(req);
  const ipHash = hashIp(ip);
  if (isRateLimited(`report:${ipHash}`, 5, 60_000)) {
    return NextResponse.json({ error: "通報が多すぎます" }, { status: 429 });
  }

  const video = await prisma.video.findUnique({
    where: { id: parsed.data.videoId },
  });
  if (!video) {
    return NextResponse.json({ error: "動画が見つかりません" }, { status: 404 });
  }

  await prisma.report.create({
    data: {
      videoId: parsed.data.videoId,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ success: true });
}
