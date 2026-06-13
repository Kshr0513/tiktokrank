import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/ipHash";
import { isRateLimited } from "@/lib/rateLimit";

const BodySchema = z.object({
  videoId: z.string().min(1).max(100),
});

function getIp(req: NextRequest): string {
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const ip = getIp(req);
  const ipHash = hashIp(ip);

  // レートリミット: IPあたり60回/分
  if (isRateLimited(`click:${ipHash}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます" },
      { status: 429 }
    );
  }

  const { videoId } = parsed.data;

  // 動画の存在確認と非表示チェック
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.isHidden) {
    return NextResponse.json({ error: "動画が見つかりません" }, { status: 404 });
  }

  // 同一IP×同一動画×同日は1回のみカウント
  // SQLite の date() 関数で日付を比較するため、当日の範囲で既存レコードを確認する
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.click.findFirst({
    where: {
      videoId,
      ipHash,
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  });

  if (existing) {
    // 重複は無視して ok: true を返す（クライアントに詳細を露出しない）
    return NextResponse.json({ ok: true });
  }

  await prisma.click.create({
    data: { videoId, ipHash },
  });

  return NextResponse.json({ ok: true });
}
