const ALLOWED_HOSTS = new Set([
  "www.tiktok.com",
  "tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "m.tiktok.com",
]);

const VIDEO_ID_RE = /\/video\/(\d+)/;

export class TikTokUrlError extends Error {}

/** Resolve short URL redirects to the canonical long URL. */
async function resolveRedirects(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  return res.url;
}

/** Extract numeric video ID from a canonical TikTok URL. */
function extractVideoId(url: string): string {
  const match = VIDEO_ID_RE.exec(url);
  if (!match) throw new TikTokUrlError("動画IDを抽出できませんでした");
  return match[1];
}

/**
 * Normalise any TikTok URL to its canonical form.
 * Returns { videoId, canonicalUrl }.
 */
export async function normalizeTikTokUrl(
  raw: string
): Promise<{ videoId: string; canonicalUrl: string }> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new TikTokUrlError("URLの形式が正しくありません");
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new TikTokUrlError("TikTokのURLのみ投稿できます");
  }

  // Short URLs need redirect resolution
  const isShort =
    parsed.hostname === "vm.tiktok.com" || parsed.hostname === "vt.tiktok.com";
  const longUrl = isShort ? await resolveRedirects(raw) : raw;

  const videoId = extractVideoId(longUrl);
  const canonicalUrl = `https://www.tiktok.com/@/video/${videoId}`;
  return { videoId, canonicalUrl };
}

export interface OEmbedData {
  title: string;
  authorName: string;
  thumbnailUrl: string;
}

/** Fetch oEmbed metadata for a TikTok video URL. Falls back gracefully. */
export async function fetchOEmbed(videoUrl: string): Promise<OEmbedData> {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title ?? "TikTok動画",
      authorName: data.author_name ?? "",
      thumbnailUrl: data.thumbnail_url ?? "",
    };
  } catch {
    return { title: "TikTok動画", authorName: "", thumbnailUrl: "" };
  }
}

/**
 * 動画がTikTok上に存在するか確認する。
 * - 404 → 削除済みと判断して false を返す
 * - タイムアウト等の一時的なエラー → 判断不能なので true を返す（誤非表示を防ぐ）
 */
export async function checkVideoExists(videoUrl: string): Promise<boolean> {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    // 404 または 400 系は動画が存在しないと判断
    if (res.status === 404 || res.status === 400) return false;
    return true;
  } catch {
    // ネットワークエラー・タイムアウトは一時障害の可能性があるので存在扱い
    return true;
  }
}
