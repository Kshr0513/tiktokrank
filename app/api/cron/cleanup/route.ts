import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchOEmbed } from "@/lib/tiktok";

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

  // 3. サムネイルURLの期限切れチェックと自動更新
  const now = Date.now();
  const expiryThreshold = Math.floor(now / 1000) + 60 * 60; // 現在時刻 + 1時間（秒）

  const videosWithThumbnail = await prisma.video.findMany({
    where: { isHidden: false, thumbnailUrl: { not: null } },
    select: { id: true, url: true, thumbnailUrl: true },
    take: 50,
  });

  let updatedThumbnails = 0;

  for (const video of videosWithThumbnail) {
    if (!video.thumbnailUrl) continue;

    let needsRefresh = false;
    try {
      const thumbUrl = new URL(video.thumbnailUrl);
      const xExpires = thumbUrl.searchParams.get("x-expires");
      if (xExpires !== null) {
        const expiresAt = parseInt(xExpires, 10);
        if (!isNaN(expiresAt) && expiresAt < expiryThreshold) {
          needsRefresh = true;
        }
      }
    } catch {
      // URLパースエラーは無視
    }

    if (!needsRefresh) continue;

    const oembed = await fetchOEmbed(video.url);
    if (oembed.thumbnailUrl && oembed.thumbnailUrl !== video.thumbnailUrl) {
      await prisma.video.update({
        where: { id: video.id },
        data: { thumbnailUrl: oembed.thumbnailUrl },
      });
      updatedThumbnails++;
    }
  }

  console.log(
    `[cron/cleanup] videos=${deletedVideos} submissions_hidden=${deletedSubmissionsByHidden} ` +
    `submissions_expired=${deletedOldSubmissions} reports=${deletedReports} ` +
    `thumbnails_updated=${updatedThumbnails}`
  );

  return NextResponse.json({
    deletedVideos,
    deletedSubmissions: deletedSubmissionsByHidden + deletedOldSubmissions,
    deletedReports,
    updatedThumbnails,
  });
}
