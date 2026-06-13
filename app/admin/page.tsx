import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkBasicAuth } from "@/lib/adminAuth";

// C-2: HTML form POST は Authorization ヘッダを送らないため Server Action に変更
async function toggleVideo(formData: FormData) {
  "use server";
  const headersList = await headers();
  if (!checkBasicAuth(headersList.get("authorization"))) return;

  const videoId = formData.get("videoId");
  if (typeof videoId !== "string" || !videoId) return;

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return;

  await prisma.video.update({
    where: { id: videoId },
    data: { isHidden: !video.isHidden },
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const headersList = await headers();
  const auth = headersList.get("authorization");

  if (!checkBasicAuth(auth)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
      },
    }) as unknown as never;
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { video: { select: { title: true, isHidden: true, url: true } } },
  });

  const hiddenVideos = await prisma.video.findMany({
    where: { isHidden: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">管理画面</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">通報一覧 ({reports.length}件)</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">通報はありません</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="bg-white border rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.video.title ?? r.videoId}</p>
                    <p className="text-gray-500 mt-0.5">理由: {r.reason}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(r.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1 items-end">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.video.isHidden
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {r.video.isHidden ? "非表示" : "表示中"}
                    </span>
                    <form action={toggleVideo}>
                      <input type="hidden" name="videoId" value={r.videoId} />
                      <button
                        type="submit"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {r.video.isHidden ? "表示に戻す" : "非表示にする"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          非表示動画 ({hiddenVideos.length}件)
        </h2>
        {hiddenVideos.length === 0 ? (
          <p className="text-gray-500">非表示の動画はありません</p>
        ) : (
          <div className="space-y-2">
            {hiddenVideos.map((v) => (
              <div key={v.id} className="bg-white border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{v.title ?? v.id}</p>
                    <p className="text-gray-500 text-xs">{v.url}</p>
                  </div>
                  <form action={toggleVideo}>
                    <input type="hidden" name="videoId" value={v.id} />
                    <button type="submit" className="text-xs text-blue-600 hover:underline shrink-0">
                      表示に戻す
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
