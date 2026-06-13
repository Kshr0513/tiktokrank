import { ImageResponse } from "next/og";
import { createClient } from "@libsql/client";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ id: string }>;

interface VideoRow {
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
}

async function getVideoInfo(id: string): Promise<VideoRow | null> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) return null;

  const client = createClient({ url, authToken });
  try {
    const result = await client.execute({
      sql: "SELECT title, authorName, thumbnailUrl FROM Video WHERE id = ? AND isHidden = 0",
      args: [id],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      title: (row["title"] as string | null) ?? null,
      authorName: (row["authorName"] as string | null) ?? null,
      thumbnailUrl: (row["thumbnailUrl"] as string | null) ?? null,
    };
  } catch {
    return null;
  } finally {
    client.close();
  }
}

export default async function Image({ params }: { params: Params }) {
  const { id } = await params;
  const video = await getVideoInfo(id);

  const title = video?.title ?? "TikTok動画";
  const authorName = video?.authorName ?? null;
  const thumbnailUrl = video?.thumbnailUrl ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          backgroundColor: "#fff1f2",
          fontFamily: "sans-serif",
        }}
      >
        {/* 左側: サムネイル */}
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            style={{
              width: "420px",
              height: "630px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "420px",
              height: "630px",
              backgroundColor: "#fecdd3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "80px",
                color: "#fb7185",
              }}
            >
              ♪
            </div>
          </div>
        )}

        {/* 右側: テキストエリア */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px",
            flex: 1,
            gap: "16px",
          }}
        >
          {/* サイト名 */}
          <p
            style={{
              fontSize: "22px",
              color: "#9ca3af",
              margin: 0,
              fontWeight: 500,
            }}
          >
            TikTok保存ランキング
          </p>

          {/* 動画タイトル */}
          <p
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </p>

          {/* 投稿者名 */}
          {authorName && (
            <p
              style={{
                fontSize: "28px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              @{authorName}
            </p>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
