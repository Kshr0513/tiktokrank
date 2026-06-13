import { prisma } from "@/lib/prisma";

export type Period = "realtime" | "daily" | "weekly" | "monthly" | "all";

function periodStart(period: Exclude<Period, "realtime">): Date | null {
  const now = new Date();
  switch (period) {
    case "daily":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
  }
}

export interface RankingEntry {
  rank: number;
  videoId: string;
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  count: number;
}

export interface FeedEntry {
  videoId: string;
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  submittedAt: Date;
}

/** 最新投稿順フィード（リアルタイムタブ用）。動画単位で重複除去し、最新投稿時刻順に返す */
export async function getRealtimeFeed(
  page = 1,
  perPage = 50
): Promise<{ entries: FeedEntry[]; total: number }> {
  // 動画ごとに最新のsubmission時刻を取得して新着順に並べる
  const grouped = await prisma.submission.groupBy({
    by: ["videoId"],
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  // W-2: isHidden 動画を total から除外（ページネーション計算の正確化）
  const total = await prisma.video.count({
    where: { isHidden: false, submissions: { some: {} } },
  });

  const videoIds = grouped.map((g) => g.videoId);
  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds }, isHidden: false },
  });
  const videoMap = new Map(videos.map((v) => [v.id, v]));

  const entries: FeedEntry[] = grouped
    .filter((g) => videoMap.has(g.videoId))
    .map((g) => {
      const v = videoMap.get(g.videoId)!;
      return {
        videoId: g.videoId,
        url: v.url,
        title: v.title,
        authorName: v.authorName,
        thumbnailUrl: v.thumbnailUrl,
        submittedAt: g._max.createdAt!,
      };
    });

  return { entries, total };
}

export async function getRanking(
  period: Exclude<Period, "realtime">,
  page = 1,
  perPage = 50
): Promise<{ entries: RankingEntry[]; total: number }> {
  const since = periodStart(period as Exclude<Period, "realtime">);
  const whereClause = since ? { createdAt: { gte: since } } : {};

  const grouped = await prisma.submission.groupBy({
    by: ["videoId"],
    where: whereClause,
    _count: { videoId: true },
    orderBy: { _count: { videoId: "desc" } },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  // W-1: isHidden 動画を total から除外（ページネーション計算の正確化）
  const total = await prisma.video.count({
    where: {
      isHidden: false,
      ...(since
        ? { submissions: { some: { createdAt: { gte: since } } } }
        : { submissions: { some: {} } }),
    },
  });

  const videoIds = grouped.map((g) => g.videoId);
  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds }, isHidden: false },
  });
  const videoMap = new Map(videos.map((v) => [v.id, v]));

  const entries: RankingEntry[] = grouped
    .filter((g) => videoMap.has(g.videoId))
    .map((g, i) => {
      const v = videoMap.get(g.videoId)!;
      return {
        rank: (page - 1) * perPage + i + 1,
        videoId: g.videoId,
        url: v.url,
        title: v.title,
        authorName: v.authorName,
        thumbnailUrl: v.thumbnailUrl,
        count: g._count.videoId,
      };
    });

  return { entries, total };
}

export async function getClickRanking(
  period: Exclude<Period, "realtime">,
  page = 1,
  perPage = 50
): Promise<{ entries: RankingEntry[]; total: number }> {
  const since = periodStart(period as Exclude<Period, "realtime">);
  const whereClause = since ? { createdAt: { gte: since } } : {};

  const grouped = await prisma.click.groupBy({
    by: ["videoId"],
    where: whereClause,
    _count: { videoId: true },
    orderBy: { _count: { videoId: "desc" } },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const total = await prisma.video.count({
    where: {
      isHidden: false,
      ...(since
        ? { clicks: { some: { createdAt: { gte: since } } } }
        : { clicks: { some: {} } }),
    },
  });

  const videoIds = grouped.map((g) => g.videoId);
  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds }, isHidden: false },
  });
  const videoMap = new Map(videos.map((v) => [v.id, v]));

  const entries: RankingEntry[] = grouped
    .filter((g) => videoMap.has(g.videoId))
    .map((g, i) => {
      const v = videoMap.get(g.videoId)!;
      return {
        rank: (page - 1) * perPage + i + 1,
        videoId: g.videoId,
        url: v.url,
        title: v.title,
        authorName: v.authorName,
        thumbnailUrl: v.thumbnailUrl,
        count: g._count.videoId,
      };
    });

  return { entries, total };
}
