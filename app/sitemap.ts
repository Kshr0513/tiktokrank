import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // 1時間キャッシュ

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes("example.com")) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://tiktokrank.example.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "always", priority: 1.0 },
    { url: `${BASE_URL}/ranking/realtime`, changeFrequency: "always", priority: 0.9 },
    { url: `${BASE_URL}/ranking/daily`, changeFrequency: "always", priority: 0.9 },
    { url: `${BASE_URL}/ranking/weekly`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/ranking/monthly`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/ranking/all`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let videos: { id: string; createdAt: Date }[] = [];
  try {
    videos = await prisma.video.findMany({
      where: { isHidden: false },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
  } catch (e) {
    console.error("[sitemap] DB query failed, returning static pages only:", e);
  }

  const videoPages: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${BASE_URL}/video/${v.id}`,
    lastModified: v.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...videoPages];
}
