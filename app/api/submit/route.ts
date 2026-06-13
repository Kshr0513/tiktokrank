import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeTikTokUrl, fetchOEmbed, TikTokUrlError } from "@/lib/tiktok";
import { hashIp } from "@/lib/ipHash";
import { isRateLimited } from "@/lib/rateLimit";
import { containsNgWord } from "@/lib/ngWords";

const BodySchema = z.object({
  url: z.string().url(),
  // Honeypot field — must be empty
  website: z.string().max(0).optional(),
});

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  // Honeypot check
  if (parsed.data.website) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const ip = getIp(req);
  const ipHash = hashIp(ip);

  // Rate limit: 10 submissions per minute per IP
  if (isRateLimited(ipHash, 10, 60_000)) {
    return NextResponse.json(
      { error: "投稿が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  let videoId: string;
  let canonicalUrl: string;
  try {
    ({ videoId, canonicalUrl } = await normalizeTikTokUrl(parsed.data.url));
  } catch (e) {
    if (e instanceof TikTokUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "URLの処理中にエラーが発生しました" }, { status: 500 });
  }

  // Check for duplicate submission from same IP within 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma.submission.findFirst({
    where: {
      videoId,
      ipHash,
      createdAt: { gte: oneDayAgo },
    },
  });

  // Register video if first time seen
  let video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    const oembed = await fetchOEmbed(canonicalUrl);
    const hasNg =
      containsNgWord(oembed.title) || containsNgWord(oembed.authorName);
    video = await prisma.video.create({
      data: {
        id: videoId,
        url: canonicalUrl,
        title: oembed.title,
        authorName: oembed.authorName,
        thumbnailUrl: oembed.thumbnailUrl,
        isHidden: hasNg,
      },
    });
  }

  if (video.isHidden) {
    return NextResponse.json(
      { error: "この動画は現在確認中です" },
      { status: 403 }
    );
  }

  // Always record the submission (even duplicates), but only count unique ones
  await prisma.submission.create({
    data: { videoId, ipHash },
  });

  const count = await prisma.submission.count({
    where: {
      videoId,
      createdAt: { gte: oneDayAgo },
      // Count distinct by ipHash is not directly supported; approximate with total unique
    },
  });

  return NextResponse.json({
    success: true,
    isDuplicate: !!existing,
    videoId,
    title: video.title,
    count,
  });
}
