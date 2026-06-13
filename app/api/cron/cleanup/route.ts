import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron Jobs は Authorization: Bearer <CRON_SECRET> を付与して呼び出す
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

const SUBMISSION_RETENTION_DAYS = 90;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. isHidden=true の動画を関連データごと削除
  const hiddenVideos = await prisma.video.findMany({
    where: { isHidden: true },
    select: { id: true },
  });
  const ids = hiddenVideos.map((v) => v.id);

  let deletedVideos = 0;
  let deletedSubmissionsByHidden = 0;
  let deletedReports = 0;

  if (ids.length > 0) {
    // リレーション制約があるため Report → Submission → Video の順で削除
    const [reports, submissions, videos] = await prisma.$transaction([
      prisma.report.deleteMany({ where: { videoId: { in: ids } } }),
      prisma.submission.deleteMany({ where: { videoId: { in: ids } } }),
      prisma.video.deleteMany({ where: { id: { in: ids } } }),
    ]);
    deletedVideos = videos.count;
    deletedSubmissionsByHidden = submissions.count;
    deletedReports = reports.count;
  }

  // 2. 90日超えの Submission を削除（ipHash のプライバシー保持期限）
  const retentionCutoff = new Date(
    Date.now() - SUBMISSION_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );
  const { count: deletedOldSubmissions } = await prisma.submission.deleteMany({
    where: { createdAt: { lt: retentionCutoff } },
  });

  console.log(
    `[cron/cleanup] videos=${deletedVideos} submissions_hidden=${deletedSubmissionsByHidden} ` +
    `submissions_expired=${deletedOldSubmissions} reports=${deletedReports}`
  );

  return NextResponse.json({
    deletedVideos,
    deletedSubmissions: deletedSubmissionsByHidden + deletedOldSubmissions,
    deletedReports,
  });
}
