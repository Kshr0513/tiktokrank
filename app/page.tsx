import type { Metadata } from "next";
import { getRanking, getClickRanking } from "@/lib/ranking";
import { RankingList } from "@/components/RankingList";
import { SubmitForm } from "@/components/SubmitForm";
import { Pagination } from "@/components/Pagination";
import { AdSlot } from "@/components/AdSlot";
import { SortTabs } from "@/components/SortTabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TikTok保存ランキング | Twitter保存ランキングのTikTok版 - 今バズってる動画",
  description:
    "Twitter保存ランキングのようにTikTokの人気動画をリアルタイム集計。今みんなが注目している動画がわかります。",
};

const PER_PAGE = 50;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const currentSort: "submit" | "click" = sortParam === "click" ? "click" : "submit";
  const { entries, total } =
    currentSort === "click"
      ? await getClickRanking("daily", page, PER_PAGE)
      : await getRanking("daily", page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          TikTok保存ランキング
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          今みんなが注目しているTikTok動画をリアルタイム集計。
          保存したい動画のリンクを投稿してランキングに参加しよう。
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
          <h2 className="text-lg font-bold text-gray-800">24時間ランキング</h2>
          <nav className="flex gap-2 text-xs">
            <a href="/ranking/realtime" className="text-rose-500 hover:underline">リアルタイム</a>
            <a href="/ranking/weekly" className="text-rose-500 hover:underline">週間</a>
            <a href="/ranking/monthly" className="text-rose-500 hover:underline">月間</a>
            <a href="/ranking/all" className="text-rose-500 hover:underline">総合</a>
          </nav>
        </div>
        <SortTabs currentSort={currentSort} basePath="/" currentPage={page} />
        <RankingList entries={entries} sortType={currentSort} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/"
          extraParams={currentSort === "click" ? { sort: "click" } : {}}
        />
      </section>
    </>
  );
}
