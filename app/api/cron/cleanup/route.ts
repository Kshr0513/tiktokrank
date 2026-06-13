import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron Jobs は Authorization: Bearer <CRON_SECRET> を付与して呼び出す
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // isHidden=true の動画IDを取得
  const hiddenVideos = await prisma.video.findMany({
    where: { isHidden: true },
    select: { id: true },
  });
  const ids = hiddenVideos.map((v) => v.id);

  if (ids.length === 0) {
    return NextResponse.json({ deleted: 0, message: "削除対象なし" });
  }

  // リレーション制約があるため Report → Submission → Video の順で削除
  const [reports, submissions, videos] = await prisma.$transaction([
    prisma.report.deleteMany({ where: { videoId: { in: ids } } }),
    prisma.submission.deleteMany({ where: { videoId: { in: ids } } }),
    prisma.video.deleteMany({ where: { id: { in: ids } } }),
  ]);

  console.log(`[cron/cleanup] videos=${videos.count} submissions=${submissions.count} reports=${reports.count}`);

  return NextResponse.json({
    deleted: videos.count,
    submissions: submissions.count,
    reports: reports.count,
  });
}
