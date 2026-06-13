import React from "react";
import Image from "next/image";
import type { RankingEntry } from "@/lib/ranking";
import { AdSlot } from "./AdSlot";
import { ReportButton } from "./ReportButton";

interface Props {
  entries: RankingEntry[];
}

export function RankingList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        まだ投稿がありません。最初のリンクを投稿してみましょう！
      </p>
    );
  }

  const items: React.ReactNode[] = [];
  entries.forEach((entry, idx) => {
    if (idx > 0 && idx % 5 === 0) {
      items.push(<AdSlot position="infeed" key={`ad-${idx}`} />);
    }
    items.push(
      <li
        key={entry.videoId}
        className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 p-3"
      >
            <span
              className={`text-lg font-bold w-8 text-center shrink-0 ${
                entry.rank <= 3 ? "text-rose-500" : "text-gray-400"
              }`}
            >
              {entry.rank}
            </span>

            {entry.thumbnailUrl ? (
              <div className="relative w-14 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={entry.thumbnailUrl}
                  alt={entry.title ?? "TikTok動画"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-20 shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                No img
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-snug line-clamp-2">
                {entry.title ?? "TikTok動画"}
              </p>
              {entry.authorName && (
                <p className="text-xs text-gray-500 mt-0.5">@{entry.authorName}</p>
              )}
              <p className="text-xs text-rose-500 mt-1 font-medium">
                {entry.count}件の投稿
              </p>
              <div className="mt-1">
                <ReportButton videoId={entry.videoId} />
              </div>
            </div>

            <a
              href={`/video/${entry.videoId}`}
              className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors text-center"
            >
              TikTokで見る
            </a>
          </li>
    );
  });

  return (
    <ol className="space-y-2">
      {items}
    </ol>
  );
}
