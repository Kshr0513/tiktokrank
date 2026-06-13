import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

// React cache でリクエスト内の重複クエリを排除
const getVideo = cache(async (id: string) => {
  return prisma.video.findUnique({ where: { id, isHidden: false } });
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return {};

  return {
    title: video.title ?? "TikTok動画",
    description: `${video.authorName ? `@${video.authorName} の` : ""}TikTok動画。TikTok保存ランキングで人気の動画です。`,
    alternates: { canonical: `/video/${id}` },
    openGraph: {
      images: video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : [],
    },
  };
}

export default async function VideoPage({ params }: { params: Params }) {
  const { id } = await params;

  // getVideo + counts を並列取得
  const [video, totalCount, clickCount] = await Promise.all([
    getVideo(id),
    prisma.submission.count({ where: { videoId: id } }),
    prisma.click.count({ where: { videoId: id } }),
  ]);

  if (!video) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const shareText = `${video.title ?? "TikTok動画"} #TikTok保存ランキング`;
  const shareUrl = `${baseUrl}/video/${id}`;
  const xShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title ?? "TikTok動画",
    description: `${video.authorName ? `@${video.authorName} の` : ""}TikTok動画`,
    uploadDate: video.createdAt.toISOString(),
    thumbnailUrl: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    author: video.authorName ? { "@type": "Person", name: video.authorName } : undefined,
    url: video.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {video.thumbnailUrl && (
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <Image
              src={video.thumbnailUrl}
              alt={video.title ?? "TikTok動画"}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {video.title ?? "TikTok動画"}
          </h1>
          {video.authorName && (
            <p className="text-sm text-gray-500 mb-4">@{video.authorName}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-rose-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-rose-500">{totalCount}</p>
              <p className="text-xs text-gray-600 mt-0.5">累計投稿数</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{clickCount}</p>
              <p className="text-xs text-gray-600 mt-0.5">クリック数</p>
            </div>
          </div>

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            TikTokで見る / 保存する
          </a>
          <a
            href={xShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-400 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            <span className="font-bold">𝕏</span> でシェアする
          </a>
        </div>
      </div>

      <AdSlot position="footer" />
    </>
  );
}
