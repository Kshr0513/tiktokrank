import React from "react";
import Image from "next/image";
import type { FeedEntry } from "@/lib/ranking";
import { ReportButton } from "./ReportButton";

interface Props {
  entries: FeedEntry[];
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

export function RealtimeFeed({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        まだ投稿がありません。最初のリンクを投稿してみましょう！
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {entries.map((entry) => (
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

            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
              {timeAgo(entry.submittedAt)}
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
              <ReportButton videoId={entry.videoId} />
              <a
                href={`/video/${entry.videoId}`}
                className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors text-center"
              >
                TikTokで見る
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
