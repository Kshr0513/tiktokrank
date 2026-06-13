import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RankingList } from "@/components/RankingList";
import type { RankingEntry } from "@/lib/ranking";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

type Params = Promise<{ date: string }>;

/** YYYY-MM-DD 形式の日付文字列を検証する */
function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T00:00:00+09:00");
  return !isNaN(d.getTime());
}

/** JST での日付範囲 [start, end) を UTC の Date で返す */
function getJstDayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(dateStr + "T00:00:00+09:00");
  const end = new Date(dateStr + "T00:00:00+09:00");
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/** JST での "YYYY年MM月DD日" 表示文字列を返す */
function formatJstDateJa(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month ?? "1", 10)}月${parseInt(day ?? "1", 10)}日`;
}

async function getArchiveRanking(
  dateStr: string
): Promise<{ entries: RankingEntry[]; total: number }> {
  const { start, end } = getJstDayRange(dateStr);

  const grouped = await prisma.submission.groupBy({
    by: ["videoId"],
    where: { createdAt: { gte: start, lt: end } },
    _count: { videoId: true },
    orderBy: { _count: { videoId: "desc" } },
  });

  const videoIds = grouped.map((g) => g.videoId);
  if (videoIds.length === 0) return { entries: [], total: 0 };

  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds }, isHidden: false },
  });
  const videoMap = new Map(videos.map((v) => [v.id, v]));

  const entries: RankingEntry[] = grouped
    .filter((g) => videoMap.has(g.videoId))
    .map((g, i) => {
      const v = videoMap.get(g.videoId)!;
      return {
        rank: i + 1,
        videoId: g.videoId,
        url: v.url,
        title: v.title,
        authorName: v.authorName,
        thumbnailUrl: v.thumbnailUrl,
        count: g._count.videoId,
      };
    });

  return { entries, total: entries.length };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { date } = await params;
  if (!isValidDateString(date)) return {};

  const dateLabel = formatJstDateJa(date);
  return {
    title: `【${dateLabel}】TikTok保存ランキング アーカイブ`,
    description: `${dateLabel}のTikTok保存ランキングアーカイブ。この日に最も多く投稿された動画を確認できます。`,
    alternates: { canonical: `/ranking/archive/${date}` },
  };
}

export default async function ArchivePage({ params }: { params: Params }) {
  const { date } = await params;

  // 日付バリデーション
  if (!isValidDateString(date)) notFound();

  const today = new Date();
  // JST の今日 0:00 を UTC で算出
  const todayJstMidnight = new Date(
    today.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" }) + "T00:00:00+09:00"
  );
  const requestedDate = new Date(date + "T00:00:00+09:00");

  // 未来の日付は404
  if (requestedDate >= todayJstMidnight) notFound();

  // 90日以上前は404
  const ninetyDaysAgo = new Date(todayJstMidnight.getTime() - 90 * 24 * 60 * 60 * 1000);
  if (requestedDate < ninetyDaysAgo) notFound();

  const { entries } = await getArchiveRanking(date);
  const dateLabel = formatJstDateJa(date);

  // 昨日の日付(JST)を計算してナビゲーション用に使用
  const yesterdayJst = new Date(todayJstMidnight.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayJst.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {dateLabel} アーカイブ
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {dateLabel}にみんなが保存したTikTok動画のランキングです。
        </p>
        <div className="flex gap-3 text-xs">
          <a href="/" className="text-rose-500 hover:underline">
            ← 最新ランキングへ
          </a>
          {date !== yesterdayStr && (
            <a
              href={`/ranking/archive/${yesterdayStr}`}
              className="text-rose-500 hover:underline"
            >
              昨日のランキング
            </a>
          )}
        </div>
      </section>

      <AdSlot position="header" />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{dateLabel} ランキング</h2>
        </div>
        <RankingList entries={entries} sortType="submit" />
      </section>

      <AdSlot position="footer" />
    </>
  );
}
