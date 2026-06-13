import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBasicAuth } from "@/lib/adminAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  if (!checkBasicAuth(req.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { videoId } = await params;
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.video.update({
    where: { id: videoId },
    data: { isHidden: !video.isHidden },
  });

  return NextResponse.redirect(new URL("/admin", req.url));
}
