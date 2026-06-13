import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRanking, getRealtimeFeed, type Period } from "@/lib/ranking";
import { RankingList } from "@/components/RankingList";
import { RealtimeFeed } from "@/components/RealtimeFeed";
import { Pagination } from "@/components/Pagination";
import { AdSlot } from "@/components/AdSlot";
import { SubmitForm } from "@/components/SubmitForm";

export const revalidate = 60;

const PERIOD_LABELS: Record<Period, string> = {
  realtime: "リアルタイム",
  daily: "24時間",
  weekly: "週間",
  monthly: "月間",
  all: "総合",
};

const VALID_PERIODS: Period[] = ["realtime", "daily", "weekly", "monthly", "all"];

const PER_PAGE = 50;

type Params = Promise<{ period: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { period } = await params;
  if (!VALID_PERIODS.includes(period as Period)) return {};
  const label = PERIOD_LABELS[period as Period];
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (period === "realtime") {
    return {
      title: `TikTok リアルタイム投稿フィード`,
      description: "今まさに投稿されているTikTok動画を新着順で確認できます。",
      alternates: { canonical: "/ranking/realtime" },
    };
  }
  return {
    title: `【${today}】TikTok ${label}人気ランキング`,
    description: `TikTokの${label}人気動画ランキング。今みんなが注目している動画をリアルタイムで確認できます。`,
    // W-6: daily は / と同一コンテンツなので canonical を / に向ける
    alternates: { canonical: period === "daily" ? "/" : `/ranking/${period}` },
  };
}

export function generateStaticParams() {
  return VALID_PERIODS.map((period) => ({ period }));
}

export default async function RankingPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { period } = await params;
  const { page: pageParam } = await searchParams;

  if (!VALID_PERIODS.includes(period as Period)) notFound();

  const typedPeriod = period as Period;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const label = PERIOD_LABELS[typedPeriod];

  const otherPeriods = VALID_PERIODS.filter((p) => p !== typedPeriod);

  if (typedPeriod === "realtime") {
    const { entries, total } = await getRealtimeFeed(page, PER_PAGE);
    const totalPages = Math.ceil(total / PER_PAGE);

    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            リアルタイム投稿フィード
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            投稿された順に表示しています。
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              TikTokのリンクを投稿する
            </p>
            <SubmitForm />
          </div>
        </section>

        <AdSlot position="header" />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">新着順</h2>
            <nav className="flex gap-2 text-xs">
              {otherPeriods.map((p) => (
                <a key={p} href={`/ranking/${p}`} className="text-rose-500 hover:underline">
                  {PERIOD_LABELS[p]}
                </a>
              ))}
            </nav>
          </div>
          <RealtimeFeed entries={entries} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/ranking/realtime"
          />
        </section>
      </>
    );
  }

  const { entries, total } = await getRanking(typedPeriod, page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  // S-5: ランキングページの ItemList 構造化データ
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `TikTok ${label}ランキング`,
    itemListElement: entries.map((entry) => ({
      "@type": "ListItem",
      position: entry.rank,
      url: `${BASE_URL}/video/${entry.videoId}`,
      name: entry.title ?? "TikTok動画",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          TikTok {label}ランキング
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {label}で最も多く投稿されたTikTok動画のランキングです。
        </p>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            TikTokのリンクを投稿する
          </p>
          <SubmitForm />
        </div>
      </section>

      <AdSlot position="header" />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{label}ランキング</h2>
          <nav className="flex gap-2 text-xs">
            {otherPeriods.map((p) => (
              <a key={p} href={`/ranking/${p}`} className="text-rose-500 hover:underline">
                {PERIOD_LABELS[p]}
              </a>
            ))}
          </nav>
        </div>
        <RankingList entries={entries} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/ranking/${period}`}
        />
      </section>
    </>
  );
}
