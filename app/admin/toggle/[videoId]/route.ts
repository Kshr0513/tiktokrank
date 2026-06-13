import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkBasicAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;
  const b64 = authHeader.slice(6);
  const decoded = Buffer.from(b64, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");
  return (
    user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD
  );
}

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
