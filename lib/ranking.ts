import { unstable_cache } from "next/cache";
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

export const getRealtimeFeed = unstable_cache(
  async (page = 1, perPage = 50): Promise<{ entries: FeedEntry[]; total: number }> => {
    const [grouped, total] = await Promise.all([
      prisma.submission.groupBy({
        by: ["videoId"],
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: "desc" } },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.video.count({
        where: { isHidden: false, submissions: { some: {} } },
      }),
    ]);

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
  },
  ["realtime-feed"],
  { revalidate: 30, tags: ["ranking"] }
);

export const getRanking = unstable_cache(
  async (
    period: Exclude<Period, "realtime">,
    page = 1,
    perPage = 50
  ): Promise<{ entries: RankingEntry[]; total: number }> => {
    const since = periodStart(period);
    const whereClause = since ? { createdAt: { gte: since } } : {};

    const grouped = await prisma.submission.groupBy({
      by: ["videoId"],
      where: whereClause,
      _count: { videoId: true },
      orderBy: { _count: { videoId: "desc" } },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const videoIds = grouped.map((g) => g.videoId);
    const [total, videos] = await Promise.all([
      prisma.video.count({
        where: {
          isHidden: false,
          ...(since
            ? { submissions: { some: { createdAt: { gte: since } } } }
            : { submissions: { some: {} } }),
        },
      }),
      prisma.video.findMany({
        where: { id: { in: videoIds }, isHidden: false },
      }),
    ]);

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
  },
  ["ranking"],
  { revalidate: 60, tags: ["ranking"] }
);

export const getClickRanking = unstable_cache(
  async (
    period: Exclude<Period, "realtime">,
    page = 1,
    perPage = 50
  ): Promise<{ entries: RankingEntry[]; total: number }> => {
    const since = periodStart(period);
    const whereClause = since ? { createdAt: { gte: since } } : {};

    const grouped = await prisma.click.groupBy({
      by: ["videoId"],
      where: whereClause,
      _count: { videoId: true },
      orderBy: { _count: { videoId: "desc" } },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const videoIds = grouped.map((g) => g.videoId);
    const [total, videos] = await Promise.all([
      prisma.video.count({
        where: {
          isHidden: false,
          ...(since
            ? { clicks: { some: { createdAt: { gte: since } } } }
            : { clicks: { some: {} } }),
        },
      }),
      prisma.video.findMany({
        where: { id: { in: videoIds }, isHidden: false },
      }),
    ]);

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
  },
  ["click-ranking"],
  { revalidate: 60, tags: ["ranking"] }
);
