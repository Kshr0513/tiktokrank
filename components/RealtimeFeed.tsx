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
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.videoId}
          className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 p-3"
        >
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
            <p className="text-xs text-gray-400 mt-1">{timeAgo(entry.submittedAt)}</p>
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
      ))}
    </ul>
  );
}
