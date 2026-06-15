import React from "react";
import Image from "next/image";
import type { RankingEntry } from "@/lib/ranking";
import { AdSlot } from "./AdSlot";
import { ReportButton } from "./ReportButton";
import { VideoLink } from "./VideoLink";

interface Props {
  entries: RankingEntry[];
  sortType?: "submit" | "click";
}

export function RankingList({ entries, sortType = "submit" }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        まだ投稿がありません。最初のリンクを投稿してみましょう！
      </p>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const items: React.ReactNode[] = [];
  entries.forEach((entry, idx) => {
    if (idx > 0 && idx % 5 === 0) {
      items.push(
        <li key={`ad-${idx}`} className="col-span-full">
          <AdSlot position="infeed" />
        </li>
      );
    }
    items.push(
      <li
        key={entry.videoId}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
      >
        <a
          href={`/video/${entry.videoId}`}
          className="relative block aspect-[9/16] bg-gray-100"
        >
          {entry.thumbnailUrl ? (
            <Image
              src={entry.thumbnailUrl}
              alt={entry.title ?? "TikTok動画"}
              fill
              sizes="(max-width: 640px) 50vw, 240px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No img
            </div>
          )}

          <span
            className={`absolute top-2 left-2 min-w-7 h-7 px-1.5 inline-flex items-center justify-center rounded-full text-sm font-bold shadow ${
              entry.rank <= 3
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-gray-700"
            }`}
          >
            {entry.rank}
          </span>

          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
            {sortType === "click" ? `${entry.count} view` : `${entry.count}件`}
          </span>
        </a>

        <div className="p-2.5 flex flex-col flex-1">
          <p className="font-medium text-sm leading-snug line-clamp-2">
            {entry.title ?? "TikTok動画"}
          </p>
          {entry.authorName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              @{entry.authorName}
            </p>
          )}

          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ReportButton videoId={entry.videoId} />
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`【${entry.rank}位】TikTok保存ランキング🔥\n\n「${entry.title ?? "TikTok動画"}」\n\n${entry.count}${sortType === "click" ? " view獲得中" : "人が保存中"}👇\n#TikTok保存ランキング #TikTok人気動画`)}&url=${encodeURIComponent(`${baseUrl}/video/${entry.videoId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                𝕏
              </a>
            </div>

            <VideoLink
              videoId={entry.videoId}
              href={`/video/${entry.videoId}`}
            />
          </div>
        </div>
      </li>
    );
  });

  return (
    <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items}
    </ol>
  );
}
